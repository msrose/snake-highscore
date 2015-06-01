angular.module('snake', [])

.controller('highscore', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
  $scope.highscores = {};

  function getScores() {
    $http.get('/highscores').then(function(success){
      $scope.highscores = success.data.highscores;
      angular.forEach($scope.highscores, function(highscore) {
        highscore.date = new Date(highscore.date);
      });
    }, function(error){
      $scope.error = "Error: " + error.data.message;
    });
  }

  getScores();
  $interval(getScores, 3000);
}]);
