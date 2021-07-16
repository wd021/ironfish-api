/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { MetricsGranularity } from '../enums/metrics-granularity';

export interface SerializedAccountMetrics {
  account_id: number;
  granularity: MetricsGranularity;
  metrics: {
    blocks_mined: number;
    bugs_caught: number;
    community_contributions: number;
    nodes_hosted: number;
    pull_requests_merged: number;
    social_media_contributions: number;
  };
}