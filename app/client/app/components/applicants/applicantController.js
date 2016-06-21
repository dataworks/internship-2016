applicantControllers.controller('ApplicantCtrl', ['$scope', '$location', 'Applicant', 'Label', '$window',
  function($scope, $location, Applicant, Label, $window) {

    //default query
    $scope.applicants = Applicant.query({
      from: $scope.index,
      size: $scope.pageSize
    });

    //default dropdown menu to 'new' on page load
    $scope.selection = "new";

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

    /**
     * sort by property name. function is called when column is clicked
     *
     * @param propertyName- type to sort by (i.e. Score)
     */
    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    /**
     * change queries when new type is selected from the dropdown menu
     *
     * @param type- select box value
     */
    $scope.showSelectValue = function(type) {
      $scope.index = 0;
      $scope.hasData = true;
      $scope.selection = type;
      $scope.applicants = Applicant.query({
        type: type,
        from: $scope.index,
        size: $scope.pageSize
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
          size: $scope.pageSize
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
     * after three seconds, hide the toast
     *
     * @param id- id of toast to show
     *
     */
    $scope.showToast = function(id) {
      document.getElementById(id).style.display = "block";
      console.log("i am here");
      setTimeout($scope.hideToast, 3000, id);
    }

    /** 
     * change toast CSS to hide the message
     *
     * @param id- id of toast to hide
     *
     */

    $scope.hideToast = function(id) {
      document.getElementById(id).style.display = "none";
      console.log("now i am here");
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

    //search code
    $scope.search = function(searchText) {
      $scope.index = 0;
      $scope.searchText = searchText;

      $scope.applicants = Applicant.query({
        query: $scope.searchText,
        from: $scope.index,
        size: $scope.pageSize
      });
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
  }
]);