Feature: Video File Upload
  As an authenticated user
  I want to upload video files
  So that they can be processed and converted into frames

  Background:
    Given I am an authenticated user

  Scenario: Successful video file upload
    Given I have a valid video file
    When I upload the video to the system
    Then I should receive a success response
    And a new file record should be created in the system
    And the video should be sent to the S3 bucket
    And a message should be sent to the processing queue