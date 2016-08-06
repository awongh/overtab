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
 * @fileoverview Test double for {@code analytics.internal.AsyncStorage}.
 *
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.testing.TestStorage');

goog.require('analytics.internal.AsyncStorage');

goog.require('goog.structs.Map');



/**
 * In memory "storage" class.
 * @constructor
 * @implements {analytics.internal.AsyncStorage}
 * @struct
 */
analytics.testing.TestStorage = function() {
  this.storage_ = new goog.structs.Map();
};


/** @override */
analytics.testing.TestStorage.prototype.get = function(key) {
  return goog.async.Deferred.succeed(this.storage_.get(key));
};


/** @override */
analytics.testing.TestStorage.prototype.set = function(key, value) {
  this.storage_.set(key, value);
  return goog.async.Deferred.succeed();
};
