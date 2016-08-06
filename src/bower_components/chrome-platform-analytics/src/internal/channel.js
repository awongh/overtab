// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Interface for communication channel used to send
 * analytics hits to Google Analytics servers.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.internal.Channel');

goog.require('analytics.HitType');
goog.require('analytics.internal.ParameterMap');

goog.require('goog.async.Deferred');



/**
 * @interface
 */
analytics.internal.Channel = function() {};


/**
 * Send the data to Google Analytics for processing.
 * @param {!analytics.HitType} hitType
 * @param {!analytics.internal.ParameterMap} parameters The parameters to send.
 * @return {!goog.async.Deferred} A Deferred that fires once the hit has
 *     been sent.
 */
analytics.internal.Channel.prototype.send;
