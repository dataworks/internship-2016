applicantControllers.controller('ApplicantCtrl', ['$scope', '$location', 'Applicant', 'Label', 'Upload', '$window', 'ngToast', '$timeout',
  function($scope, $location, Applicant, Label, Upload, $window, ngToast, $timeout) {

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

    //default query
    $scope.applicants = Applicant.query({
      from: $scope.index,
      size: $scope.pageSize,
      sort: $scope.sort,
      order: $scope.sortOrder
    });

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
        order: $scope.sortOrder
      });
    }

    /**
     * change queries when new type is selected from the dropdown menu
     *
     * @param type- select box value
     */
    $scope.showSelectValue = function(type) {
      $scope.searchText = "";
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
    };

    /**
     * adds to query if there is more data, else change hasData to false
     *
     * @param result- rest of the query
     */
    $scope.dataLoaded = function(result) {
      if (result.length > 0) {
        $scope.applicants = $scope.applicants.concat(result);
      } else {
        $scope.hasData = false;
        $scope.index = 0;
      }

      $scope.loadingData = false;
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
      };
    }

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
        $scope.applicants.splice($scope.applicants.indexOf(applicant), 1);
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
        $scope.applicants.splice($scope.applicants.indexOf(applicant), 1);
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

      else {
        ngToast.create({
          className: 'info',
          content: 'Applicant sent back to home page'
        });

      }
    }

    /** 
     * return document (image or PDF) from a link
     *
     * @param id- id of applicant
     * @param type- type of document either an image or a PDF
     *
     */

    $scope.getLink = function(id, type) {
      return "service/attachments?id=" + id + "&type=" + type;
    }

    /** 
     * return query based on text that was input in search bar
     *
     * @param searchText- text that was input in search bar
     *
     */
    $scope.search = function(searchText) {
      $scope.index = 0;
      $scope.searchText = searchText;

      $scope.applicants = Applicant.query({
        query: $scope.searchText,
        from: $scope.index,
        size: $scope.pageSize
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
          if(file.type === 'application/pdf' || file.type === 'application/doc') {
            var reader = new FileReader();

            reader.addEventListener("load", function () {
              var temp = reader.result;
              var base64string = temp.substring(28);
              console.log(base64string);
              console.log(file.type);
             
              var upload = new Upload({
                'type': 'upload',
                'base64string': base64string
              });

              upload.$save();
            }, false);

            if(file)
              reader.readAsDataURL(file);
          } else
              alert('only pdf or word doc files')
        })(files[i]);
      }
    }
    //test comment
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
*
*/
applicantControllers.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeFunc);
    }
  };
});

