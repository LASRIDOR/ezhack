const moment = require('moment');
const showdown = require('showdown');
const swal = require('sweetalert');

angular.module('reg')
  .controller('AdminSettingsCtrl', [
    '$scope',
    '$sce',
    'SettingsService',
    function($scope, $sce, SettingsService){

      $scope.settings = {};
      SettingsService
        .getPublicSettings()
        .then(response => {
          updateSettings(response.data);
        });

      function updateSettings(settings){
        $scope.loading = false;
         // Format the dates in settings.
        settings.timeOpenRegistration = new Date(settings.timeOpenRegistration);
        settings.timeCloseRegistration = new Date(settings.timeCloseRegistration);
        settings.timeOpenHackathon = new Date(settings.timeOpenHackathon);
        settings.timeCloseHackathon = new Date(settings.timeCloseHackathon);
        settings.timeConfirm = new Date(settings.timeConfirm);

        $scope.settings = settings;
      }

      // Additional Options --------------------------------------

      $scope.updateAllowMinors = function () {
        SettingsService
          .updateAllowMinors($scope.settings.allowMinors)
          .then(response => {
            $scope.settings.allowMinors = response.data.allowMinors;
            const successText = $scope.settings.allowMinors ?
              "Minors are now allowed to register." :
              "Minors are no longer allowed to register.";
            swal("Looks good!", successText, "success");
          });
      };

        $scope.openScoringSystem = function () {
            SettingsService
                .openScoringSystem($scope.settings.openScoring)
                .then(response => {
                    $scope.settings.openScoring = response.data.openScoring;
                    const successText = $scope.settings.openScoring ?
                        "Scoring system session is opened." :
                        "Scoring system session is closed.";
                    swal("Looks good!", successText, "success");
                });
        };

      // Schools Whitelist --------------------------------------

      SettingsService
        .getWhitelistedEmails()
        .then(response => {
          $scope.whitelist = response.data.join(", ");
        });

      $scope.updateWhitelist = function(){
        SettingsService
          .updateWhitelistedEmails($scope.whitelist.replace(/ /g, '').split(','))
          .then(response => {
            swal('Schools Whitelist updated.');
            $scope.whitelist = response.data.whitelistedEmails.join(", ");
          });
      };

      // Companys Whitelist --------------------------------------

      SettingsService
        .getCompanysWhitelistedEmails()
        .then(response => {
          $scope.companysWhitelist = response.data.join(", ");
        });

      $scope.updateCompanysWhitelist = function(){
        SettingsService
          .updateCompanysWhitelistedEmails($scope.companysWhitelist.replace(/ /g, '').split(','))
          .then(response => {
            swal('Companys Whitelist updated.');
            $scope.companysWhitelist = response.data.companysWhitelistedEmails.join(", ");
          });
      };

      $scope.formatDate = function(date){
        if (!date){
          return "Invalid Date";
        }

        // Hack for timezone
        return moment(date).format('dddd, MMMM Do YYYY, h:mm a') +
          " " + date.toTimeString().split(' ')[2];
      };

      // Take a date and remove the seconds.
      function cleanDate(date){
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes()
        );
      }

      $scope.updateRegistrationTimes = function(){
        // Clean the dates and turn them to ms.
        var open = cleanDate($scope.settings.timeOpenRegistration).getTime();
        var close = cleanDate($scope.settings.timeCloseRegistration).getTime();

        if (open < 0 || close < 0 || open === undefined || close === undefined){
          return swal('Oops...', 'You need to enter valid times.', 'error');
        }
        if (open >= close){
          swal('Oops...', 'Registration cannot open after it closes.', 'error');
          return;
        }

        SettingsService
          .updateRegistrationTimes(open, close)
          .then(response => {
            updateSettings(response.data);
            swal("Looks good!", "Registration Times Updated", "success");
          });
      };

      // Hackathon Times -----------------------------
      
      $scope.updateHackathonTimes = function(){
      // Clean the dates and turn them to ms.
      var open = cleanDate($scope.settings.timeOpenHackathon).getTime();
      var close = cleanDate($scope.settings.timeCloseHackathon).getTime();
      
      if (open < 0 || close < 0 || open === undefined || close === undefined){
        return swal('Oops...', 'You need to enter valid times.', 'error');
      }
      if (open >= close){
        swal('Oops...', 'Hackathon cannot open after it closes.', 'error');
       return;
      }
      if ((close - open) >= '180000000'){
        swal('Oops...', 'Are you sure that the hackathon is that long?', 'error');
       return;
      }
      
      SettingsService
        .updateHackathonTimes(open, close)
        .then(response => {
          updateSettings(response.data);
          swal("Looks good!", "Hackathon Times Updated", "success");
          });
      };

      // Confirmation Time -----------------------------

      $scope.updateConfirmationTime = function(){
        var confirmBy = cleanDate($scope.settings.timeConfirm).getTime();

        SettingsService
          .updateConfirmationTime(confirmBy)
          .then(response => {
            updateSettings(response.data);
            swal("Sounds good!", "Confirmation Date Updated", "success");
          });
      };

      // Acceptance / Confirmation Text ----------------

      var converter = new showdown.Converter();

      $scope.markdownPreview = function(text){
        return $sce.trustAsHtml(converter.makeHtml(text));
      };

      $scope.updateWaitlistText = function(){
        var text = $scope.settings.waitlistText;
        SettingsService
          .updateWaitlistText(text)
          .then(response => {
            swal("Looks good!", "Waitlist Text Updated", "success");
            updateSettings(response.data);
          });
      };

      $scope.updateAcceptanceText = function(){
        var text = $scope.settings.acceptanceText;
        SettingsService
          .updateAcceptanceText(text)
          .then(response => {
            swal("Looks good!", "Acceptance Text Updated", "success");
            updateSettings(response.data);
          });
      };

      $scope.updateConfirmationText = function(){
        var text = $scope.settings.confirmationText;
        SettingsService
          .updateConfirmationText(text)
          .then(response => {
            swal("Looks good!", "Confirmation Text Updated", "success");
            updateSettings(response.data);
          });
      };

    }]);
