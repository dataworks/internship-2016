var esservice = require("./elasticsearch.js");
var config = require("./config.js");

/*
*lists applicants based on type
*/
exports.listApplicants = function(req, res, type) {
	var query = '*';
	if (type !== 'new') {
		query = 'type: ' + type;
	}

	esservice.query(config.labels, null, res, query, function(res, hits){
  	//var ids = map source -> _id
	  var labelQuery = buildQuery(res, hits, type);
	  esservice.query(config.applicants, req, res, labelQuery, null);
	},function (error, response) {
    	console.log(error);
		});
}

/*
* Builds the query string for ES
*/
function buildQuery(res, hits, type) {
	if (hits && hits.length > 0) {
  	var ids = hits.map(function(hit) { return hit.id; });
    //same query logic * or NOT id ()
    if (ids && ids.length > 0) { 
      if(type === 'new') {
        return "NOT id:(" + ids.join(" ") + ")";
      }
      else if(type === 'favorite' || type === 'archive' || type === 'review') {
        return "id:(" + ids.join(" ") + ")";
      }
    }
  }
  return type ==='new' ? '*' : ' ';
}