// @flow

import React from "react";
import {timeWeek} from "d3-time";
import type {Assets} from "../webutil/assets";
import {TimelineCredView} from "./TimelineCredView";
import {Graph, NodeAddress} from "../core/graph";
import {type Interval} from "../analysis/computeTimelineCred.js";

export default class TimelineCredViewInspectiontest extends React.Component<{|
  +assets: Assets,
|}> {
  intervals(): Interval[] {
    const startTimeMs = +new Date(2017, 0);
    const endTimeMs = +new Date(2017, 6);
    const boundaries = timeWeek.range(startTimeMs, endTimeMs);
    const result = [];
    for (let i = 0; i < boundaries.length - 1; i++) {
      result.push({
        startTimeMs: +boundaries[i],
        endTimeMs: +boundaries[i + 1],
      });
    }
    return result;
  }

  render() {
    const intervals = this.intervals();
    const users = [
      ["starter", (x) => Math.max(0, 20 - x)],
      ["steady", (_) => 4],
      ["finisher", (x) => (x * x) / 20],
      ["latecomer", (x) => Math.max(0, x - 20)],
    ];

    const graph = new Graph();
    const nodeAddressToScores = new Map();
    for (const [name, generator] of users) {
      const address = NodeAddress.fromParts(["foo", name]);
      graph.addNode({
        address,
        description: `[@${name}](https://github.com/${name})`,
        timestampMs: null,
      });
      const scores = intervals.map((_unuesd, i) => generator(i));
      nodeAddressToScores.set(address, scores);
    }
    const timelineScores = {intervals, nodeAddressToScores};
    const selectedNodeFilter = NodeAddress.fromParts(["foo"]);
    return (
      <TimelineCredView
        graph={graph}
        timelineScores={timelineScores}
        selectedNodeFilter={selectedNodeFilter}
      />
    );
  }
}