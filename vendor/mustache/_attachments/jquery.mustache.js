/*
Shameless port of a shameless port
@defunkt => @janl => @aq
 
See http://github.com/defunkt/mustache for more info.
*/
 
;(function($) {

/*
  Shamless port of http://github.com/defunkt/mustache
  by Jan Lehnardt <jan@apache.org>, Alexander Lang <alex@upstream-berlin.com>,
     Sebastian Cohnen <sebastian.cohnen@googlemail.com>

  Thanks @defunkt for the awesome code.
  
  See http://github.com/defunkt/mustache for more info.
*/


var Mustache = function() {
  var Renderer = function() {};
  
  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",

    render: function(template, context, partials) {
      // fail fast
      if(template.indexOf(this.otag) == -1) {
        return template;
      }

      var html = this.render_section(template, context, partials);
      return this.render_tags(html, context, partials);
    },

    /* 
      Tries to find a partial in the global scope and render it
    */
    render_partial: function(name, context, partials) {
      if(typeof(context[name]) != "object") {
        throw({message: "subcontext for '" + name + "' is not an object"});
      }
	    if(!partials || !partials[name]) {
        throw({message: "unknown_partial"});
      }
      return this.render(partials[name], context[name], partials);
    },

    /*
      Renders boolean and enumerable sections
    */
    render_section: function(template, context, partials) {
      if(template.indexOf(this.otag + "#") == -1) {
        return template;
      }
      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "\\#(.+)" + this.ctag +
              "\\s*([\\s\\S]+?)" + this.otag + "\\/\\1" + this.ctag + "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, name, content) {
        var value = that.find(name, context);
        if(that.is_array(value)) { // Enumerable, Let's loop!
          return that.map(value, function(row) {
            return that.render(content, that.merge(context,
                    that.create_context(row)), partials);
          }).join('');
        } else if(that.is_iterator(value)) { // Function, let's iterate.
          var result = [];
          var row;          
          while (row = value()) {
            var rendered = that.render(content, that.merge(context,
                    that.create_context(row)), partials);
            result.push(rendered);
          } // fuck buffering, works for now though.
          return result.join('');
        } else if(value) { // boolean section
          return that.render(content, context, partials);
        } else {
          return "";
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials) {
      var lines = template.split("\n");

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|<|\\{)?([^\/#]+?)\\1?" +
          that.ctag + "+", "g");
      };

      // tit for tat
      var that = this;

      var regex = new_regex();
      for (var i=0; i < lines.length; i++) {
        lines[i] = lines[i].replace(regex, function (match,operator,name) {
          switch(operator) {
            case "!": // ignore comments
              return match;
            case "=": // set new delimiters, rebuild the replace regexp
              that.set_delimiters(name);
              regex = new_regex();
              // redo the line in order to get tags with the new delimiters 
              // on the same line
              i--;
              return "";
            case "<": // render partial
              return that.render_partial(name, context, partials);
            case "{": // the triple mustache is unescaped
              return that.find(name, context);
            default: // escape the value
              return that.escape(that.find(name, context));
          }
        },this);
      };
      return lines.join("\n");
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
    return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value 
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);
      var value = this.getValue(context, name);
      if(typeof value === "function") {
        if (value.iterator) {
          var f = function() {
            return value.apply(context);
          };
          f.iterator = true;
          return f;
        } else {
          return value.apply(context);        
        }
      }
      if(value !== undefined) {
        return value;
      }
      throw("Can't find '" + name + "' in " + context.toSource());
    },
    
    getValue: function(context, name) {
      var part, c = context, parts = name.split('.');
      try {
        while (part=parts.shift()) {
          c = c[part];
        }
        return c;      
      } catch(e) {
        throw("No value found at '"+name+"' in "+context.toSource());
      }
    },

    // Utility methods

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      return s.toString().replace(/[&"<>\\]/g, function(s) {
        switch(s) {
          case "&": return "&amp;";
          case "\\": return "\\\\";;
          case '"': return '\"';;
          case "<": return "&lt;";
          case ">": return "&gt;";
          default: return s;
        }
      });
    },

    /*
      Merges all properties of object `b` into object `a`.
      `b.property` overwrites a.property`
    */
    merge: function(a, b) {
      var _new = {};
      for(var name in a) {
        if(a.hasOwnProperty(name)) {
          _new[name] = a[name];
        }
      };
      for(var name in b) {
        if(b.hasOwnProperty(name)) {
          _new[name] = b[name];
        }
      };
      return _new;
    },

    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else {
        return {'.': _context};
      }
    },

    is_object: function(a) {
      return a && typeof a == 'object'
    },

    /*
      Thanks Doug Crockford
      JavaScript — The Good Parts lists an alternative that works better with
      frames. Frames can suck it, we use the simple version.
    */
    is_array: function(a) {
      return (a &&
        typeof a === 'object' &&
        a.constructor === Array);
    },

    is_iterator : function(f) {
      return (typeof f === 'function' && f.iterator);
    },
    
    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, '');
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */  
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn)
      } else {
        var r = [];
        var l = array.length;
        for(i=0;i<l;i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };
  
  return({
    name: "mustache.js",
    version: "0.1",
    
    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials) {
      try {
        return (new Renderer()).render(template, view, partials);
      } catch(e) {
        throw({"error":"mustache_error","reason":e.toString()})
      }
    }
  });
}();

  $.mustache = function(template, view) {
    return Mustache.to_html(template, view);
  };

})(jQuery);
