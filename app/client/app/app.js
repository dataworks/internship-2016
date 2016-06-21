var applicantApp = angular.module('applicantApp', [
  'ngRoute',
  'applicantControllers',
  'applicantServices',
  'infinite-scroll',
  'ngSanitize',
  'ngToast',
]);

var applicantControllers = angular.module('applicantControllers', []);
var applicantServices = angular.module('applicantServices', ['ngResource']);

applicantApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/applicants', {
      templateUrl: 'app/components/applicants/applicantView.html',
      controller: 'ApplicantCtrl'
    }).
    when('/search', {
      templateUrl: 'app/components/search/searchView.html',
      controller: 'SearchCtrl'
    }).
    when('/about', {
      templateUrl: 'app/components/about/aboutView.html',
      controller: 'AboutCtrl'
    }).
    when('/contact', {
      templateUrl: 'app/components/contact/contactView.html',
      controller: 'ContactCtrl'
    }).
    otherwise({
      redirectTo: '/applicants'
    });

    //sets html5Mode to avoid having '#' in URLs
    $locationProvider.html5Mode(true);
  }
]);