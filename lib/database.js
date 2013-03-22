var Entry = new require('./entryModel');

function Database() {

}

Database.prototype.upsertBracket = function(record, cb) {
  Entry.findOneAndUpdate({user_id: record.user_id}, record, {upsert: true}, cb);
};

module.exports = Database;