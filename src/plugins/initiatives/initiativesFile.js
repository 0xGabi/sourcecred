// @flow

import fs from "fs-extra";
import {NodeAddress, type NodeAddressT} from "../../core/graph";
import {fromCompat, type Compatible} from "../../util/compat";
import type {Initiative, URL, InitiativeRepository} from "./initiative";

const trackerPrefix = NodeAddress.fromParts(["sourcecred", "initiativesFile"]);
const COMPAT_INFO = {type: "sourcecred/initiatives", version: "0.1.0"};

/**
 * JSON (compat) representation of an Initiative.
 *
 * Major difference is that instead of using tracker addresses, we use object
 * keys as an ID, and derive the tracker address from that.
 */
type InitiativesFile = {[entryId: string]: InitiativeEntry};

type InitiativeEntry = {|
  +title: string,
  +timestampMs: number,
  +completed: boolean,
  +dependencies: $ReadOnlyArray<URL>,
  +references: $ReadOnlyArray<URL>,
  +contributions: $ReadOnlyArray<URL>,
  +champions: $ReadOnlyArray<URL>,
|};

function fromJSON(j: Compatible<any>): InitiativesFile {
  return fromCompat(COMPAT_INFO, j);
}

function trackerAddress(entryId: string): NodeAddressT {
  return NodeAddress.append(trackerPrefix, entryId);
}

function mapToInitiatives(
  initiativesFile: InitiativesFile
): $ReadOnlyArray<Initiative> {
  const initiatives = [];
  for (const entryId in initiativesFile) {
    const addr = trackerAddress(entryId);
    initiatives.push({
      ...initiativesFile[entryId],
      tracker: addr,
    });
  }
  return initiatives;
}

export async function loadInitiativesFile(
  path: string
): Promise<InitiativeRepository> {
  const compatJSON = await fs.readFile(path, "utf-8");
  try {
    // TODO: would make sense to use tcomb to validate.
    const initiativesFile = fromJSON(JSON.parse(compatJSON));
    const initiatives = mapToInitiatives(initiativesFile);
    const repo: InitiativeRepository = {
      initiatives: () => initiatives,
    };
    return repo;
  } catch (e) {
    throw new Error(`Provided initiatives file is invalid:\n${e}`);
  }
}

// TODO: test
