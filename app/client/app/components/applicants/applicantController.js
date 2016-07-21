applicantControllers.controller('ApplicantCtrl', ['$sce','$scope', '$location', 'Analysis', 'Applicant', 'Label', 'Suggest', 'Upload', '$window', 'ngToast', '$timeout', 'advancedSearch', 'searchAnalysis',
  function($sce, $scope, $location, analysis, Applicant, Label, Suggest, Upload, $window, ngToast, $timeout, advancedSearch, searchAnalysis) {

    //default dropdown menu to 'new' on page load
    $scope.selection = "new";
    $scope.sort = "score";
    $scope.sortOrder = "desc";

    //query should start off at index 0, displaying first item
    $scope.index = 0;
    //displaying 25 applicants at a time
    $scope.pageSize = 25;
    $scope.loadingData = false;
    $scope.hasData = true;

    //sorting table by column code
    $scope.propertyName = null;
    $scope.reverse = false;
    $scope.searchText = "";
    $scope.displayText = "";

    // for expand button
    $scope.active = true;

    //for search analytics
    $scope.showGraphs = false;

    //for search dropdown
    $scope.searchTab = false;

    $scope.queries = [$scope.languages, $scope.etl, $scope.web,
      $scope.mobile, $scope.db, $scope.bigData
    ];

    $scope.fields = ['languages', 'etl', 'web', 'mobile', 'db', 'bigData'];
    $scope.ids = ['Language', 'ETL', 'Web', 'Mobile', 'Databases', 'Big'];
    $scope.charts = [];

    /**
     * function that expands/collapses the rows for all applicants
     */
    $('.openall').click(function(){
      if ($scope.active) {
        $scope.active = false;
        $('.accordian-body:not(".in")').collapse('show');
        $(this).find('i').toggleClass('glyphicon glyphicon-plus-sign').toggleClass('glyphicon glyphicon-minus-sign');
      } 
      else {
        $scope.active = true;
        $('.accordian-body.in').collapse('hide');
        $(this).find('i').toggleClass('glyphicon glyphicon-minus-sign').toggleClass('glyphicon glyphicon-plus-sign');
      }
    });

    /**
     * function that changes the suggestion query based on the text that is in the search bar
     *
     * @param text- text that is currently in the search bar
     */

    $scope.autoComplete = function(text) {
      $scope.displayText = text;

      $scope.autoSuggest = Suggest.query({
        term: $scope.displayText
      });
    }

    //alternative to ng-change, calls $scope.autoComplete when 'searchText' has been modified
    $scope.$watch('displayText', $scope.autoComplete);

    //default query
    $scope.applicants = Applicant.query({
      from: $scope.index,
      size: $scope.pageSize,
      sort: $scope.sort,
      order: $scope.sortOrder
    });

    $scope.setGraphBool = function() {
      if ($scope.showGraphs == false) {
        $scope.showGraphs = true;
      } else {
        $scope.showGraphs = false;
      }
    }

    /**
     * sort by property name. function is called when column is clicked
     *
     * @param type- type to sort by (i.e. Score)
     */

    $scope.sortColumn = function(type) {
      $scope.index = 0;
      $scope.hasData = true;
      $scope.sort = type;

      if (type == "score") {
        $scope.sortBool = false;
      } else {
        $scope.sortBool = true;
      }

      if ($scope.sortOrder == "asc") {
        $scope.sortOrder = "desc";
        $scope.reverse = false;
      } 

      else if ($scope.sortOrder == "desc") {
        $scope.sortOrder = "asc";
        $scope.reverse = true;
      }

      $scope.applicants = Applicant.query({
        type: $scope.selection,
        from: $scope.index,
        size: $scope.pageSize,
        sort: $scope.sort,
        order: $scope.sortOrder,
        query: $scope.searchText
      });
    }

    /**
     * change queries when new type is selected from the dropdown menu
     *
     * @param type- select box value
     */
    $scope.showSelectValue = function(type) {
      $scope.searchText = "";
      $scope.displayText = "";
      $scope.index = 0;
      $scope.hasData = true;
      $scope.selection = type;
      $scope.applicants = Applicant.query({
        type: type,
        from: $scope.index,
        size: $scope.pageSize,
        sort: $scope.sort,
        order: $scope.sortOrder
      });
      if(type != 'search'){
        $scope.searchTab = false;

      }

      $scope.getAggregations(false, type);
    };

    /**
     * adds to query if there is more data, else change hasData to false
     *
     * @param result- rest of the query
     */
    $scope.dataLoaded = function(result) {
      var rows = result.rows;

      if (rows.length > 0) {
        if ($scope.applicants.rows == null) {
          $scope.applicants.rows = rows;
        } else {
          $scope.applicants.rows = $scope.applicants.rows.concat(rows);
        }
      } else {
        $scope.hasData = false;
        $scope.index = 0;
      }

      $scope.loadingData = false;
      $scope.getAggregations(false, $scope.selection);
    };

    /**
     * check if there is more data to load from the query, for infinite scroll
     *
     */
    $scope.nextPage = function() {
      if ($scope.hasData) {
        $scope.loadingData = true;
        $scope.index += $scope.pageSize;
        
        Applicant.query({
          query: $scope.searchText,
          type: $scope.selection,
          from: $scope.index,
          size: $scope.pageSize,
          order: $scope.sortOrder,
          sort: $scope.sort
        }, $scope.dataLoaded);
      }
    };

    // Only enable if the document has a long scroll bar
    // Note the window height + offset
    $('#top-link-block').removeClass('hidden').affix({
      offset: {
        top: 100
      }
    });

    /**
     * function that is called when action button is clicked, i.e. Favorite, Archive, Review
     *
     * @param id- id number of the applicant
     * @param type- type of the applicant
     * @param applicant- applicant object itself, passed in to avoid wrong indexing
     */
    $scope.mark = function(id, type, applicant) {
      var label = new Label({
        'id': id,
        'type': type
      });
      label.$save().then(function() {
        $scope.applicants.rows.splice($scope.applicants.rows.indexOf(applicant), 1);
      });
    }

    /**
     * function that is called when applicant is placed back in 'New
     *
     * @param id- id number of the applicant
     * @param applicant- applicant object itself, passed in to avoid wrong indexing
     */
    $scope.remove = function(id, applicant) {
      Label.delete({
        'id': id
      }).$promise.then(function() {
        $scope.applicants.rows.splice($scope.applicants.rows.indexOf(applicant), 1);
      });
    }

    /** 
     * change toast CSS to show the message
     * after about three seconds, hide the toast
     *
     * @param type- type of toast to show
     *
     */
    $scope.showToast = function(type) {
      if (type == 'Favorite') {
        ngToast.create("Applicant added to Favorites");
      }

      else if (type == 'Review') {
        ngToast.create({
          className: 'warning',
          content: 'Applicant added to Review'
        });

      }

      else if (type == 'Archive') {
        ngToast.create({
          className: 'danger',
          content: 'Applicant added to Archive'
        });

      }

      else if (type == 'Upload') {
        ngToast.create("Resume has been Uploaded");
      }

      else {
        ngToast.create({
          className: 'info',
          content: 'Applicant sent back to home page'
        });

      }
    }

    /** 
     * converts score to an integer, score is now out of 100
     *
     * @param score - applicant.score from Elasticsearch, a decimal number 
     */
    $scope.scaleScore = function(score) {
      return parseInt((score * 100), 10);
    }

    $scope.createScoreChart = function(applicant) {
      var keys = [];
      var values = [];
      var finalValues = [];

      //sort from least to greatest, switch a & b for opposite
      var keysSorted = Object.keys(applicant.features).sort(function(a,b) {
        return applicant.features[b]-applicant.features[a]});


      for(var key in keysSorted) {
        keys.push(keysSorted[key]);
        values.push((parseFloat(applicant.features[keysSorted[key]])).toFixed(2));
      }

      finalValues.push(values);

      var data = {
        labels: keys,
        series: finalValues,
      };

      var options = {
        high: 5,
        low: -5,
        width: '1000%',
        height: '275%',
      };

      var bar = new Chartist.Bar('.ct-chart', data, options);

      // return bar;
    }

   /**
    * styles words in an applicant's summary that matches a skill listed on his/her resume
    *
    * @param applicant - current applicant
    * @return word in HTML format to replace matched word in summary for styling
    */
    $scope.highlightSkills = function(applicant) {
     var skills = applicant.skills.bigdata;
     skills = skills.concat(applicant.skills.database);
     skills = skills.concat(applicant.skills.etl);
     skills = skills.concat(applicant.skills.webapp);
     skills = skills.concat(applicant.skills.mobile);
     skills = skills.concat(applicant.skills.language);

     var summary = applicant.summary;
     for (i = 0; i < skills.length; i++) {
       summary = summary.replace(skills[i], "<span style = 'color:#673AB7 ;'>" + skills[i] + "</span>");
     }

     return $sce.trustAsHtml(summary);
   }

    /** 
     * return image from a link
     *
     * @param id- id of applicant
     * @param type-image
     *
     */

    $scope.getLink = function(id, type) {
      return "service/attachments?id=" + id + "&type=" + type;
    }

    $scope.isSearch = function(text){
      if(text != ""){
        $scope.searchTab = true;
        $scope.selection = 'search';
      }
      else if(text == ""){
        $scope.selection = 'new';
        $scope.searchTab = false;
      }
    }

    $scope.searched = function(){
      return $scope.searchTab;
    }

    /** 
     * return query based on text that was input in search bar
     *
     * @param searchText- text that was input in search bar
     *
     */
    $scope.search = function(searchText) {
      $scope.index = 0;

      //calls the createQuery function in searchService.js
      $scope.searchText = searchText + advancedSearch.createQuery(document);

      if ($scope.searchText.charAt(0) == " ") {
        $scope.searchText = $scope.searchText.substring(5, $scope.searchText.length);
      }
      
      $scope.applicants = Applicant.query({
        type: $scope.selection,
        query: $scope.searchText,
        from: $scope.index,
        size: $scope.pageSize,
        sort: $scope.sort,
        order: $scope.sortOrder
      });

      $scope.getAggregations(true);
      //sets text in search bar to what user typed in, hides the query call
      $scope.displayText = searchText;
    }

    /*
     ** Returns aggregation data for graphs
     *
     * @param search - boolean if it is for search or not
     */
    $scope.getAggregations = function (search, type) {
      for(var i = 0; i < $scope.charts.length; i++) {
        $scope.charts[i].destroy();
      }

      $scope.queries.forEach(function(value, index) {
        if(search) {
          $scope.queries[index] = analysis.query({
            query: $scope.searchText,
            field: $scope.fields[index]
          });
        } else {
          $scope.queries[index] = analysis.query({
            type: type,
            field: $scope.fields[index]
          });
        }

        $scope.queries[index].$promise.then(function(data) {
          $scope.charts.push(searchAnalysis.displayGraph(data, $scope.ids[index]));
          });
      });
    }

    /** 
     * Converts user uploaded files to base64 strings and indexes them 
     *
     */
    $scope.upload = function() {
      var files = document.querySelector('input[type=file]').files;
      for(var i = 0; i < files.length; i++) {
        (function(file) {
          var reader = new FileReader();

          reader.addEventListener("load", function () {
            var temp = reader.result.split(',');
            var base64string = temp[1];
            var hash = calcMD5(base64string);
            
            var upload = new Upload({
              'id': hash,
              'type': 'upload',
              'base64string': base64string,
              'name': file.name,
              'processed': false
            });

            upload.$save();
          }, false);

          if(file)
            reader.readAsDataURL(file);
        })(files[i]);
      }
      $scope.showToast('Upload');

    }

    //scroll code
    $(function() {
      var lastScrollTop = 0,
        delta = 5;
      $(window).scroll(function(event) {
        var st = $(this).scrollTop();

        if (Math.abs(lastScrollTop - st) <= delta)
          return;

        //if scrolling up, hide the footer
        if (st <= lastScrollTop) {;
          angular.element("#footer").hide();
        }

        lastScrollTop = st;
      });
    });

    //if at bottom of window, show footer 
    $(window).scroll(function() {
      if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        angular.element("#footer").show();
      } else {
        angular.element("#footer").hide();
      }
    });

  }]);


/**
*
* A custom directive to bind file upload
* 
* @param: The attributes name
* @param: A callback function which binds the upload function to the attribute
*/
applicantControllers.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeFunc);
    }
  };
})
