function(doc) {
  if (doc['_attachments']) {
    emit(doc.created_at, doc);
  }
}
