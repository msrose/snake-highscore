angular.module('snake', [])

.controller('highscore', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
  $scope.highscores = {};

  function getScores() {
    $http.get('/highscores').then(function(success){
      $scope.highscores = success.data.highscores;
      angular.forEach($scope.highscores, function(score) {
        score.date = new Date(score.date);
        score.score = parseInt(score.score);
      });
    }, function(error){
      console.log("Could not get scores", error.data.message);
      $scope.error = "Error: " + error.data.message;
    });
  }

  getScores();
  $interval(getScores, 2000);
}]);
