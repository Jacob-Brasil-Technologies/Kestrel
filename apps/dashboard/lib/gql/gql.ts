/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n\tmutation StartServer($instanceId: ID!) {\n\t\tstartServer(instanceId: $instanceId)\n\t}\n": typeof types.StartServerDocument,
    "\n\tmutation StopServer($instanceId: ID!) {\n\t\tstopServer(instanceId: $instanceId)\n\t}\n": typeof types.StopServerDocument,
    "\n\tmutation RestartServer($instanceId: ID!) {\n\t\trestartServer(instanceId: $instanceId)\n\t}\n": typeof types.RestartServerDocument,
    "\n\tquery GetGames {\n\t\tgetGames {\n\t\t\tname\n\t\t\tdeveloper\n\t\t\ticon\n\t\t\tdeveloperIcon\n\t\t\ttype\n\t\t\truntime\n\t\t\tsupportedPlatforms\n\t\t\tuserConfig {\n\t\t\t\tconfigType\n\t\t\t\tdefault\n\t\t\t}\n\t\t}\n\t}\n": typeof types.GetGamesDocument,
    "\n\tquery GetVariants($for: GameType!) {\n\t\tgetVariants(for: $for) {\n\t\t\tname\n\t\t\tdescription\n\t\t\ticon\n\t\t\tvariant\n\t\t}\n\t}\n": typeof types.GetVariantsDocument,
    "\n\tquery GetVariantVersions($gameType: GameType!, $variant: GameVariant!) {\n\t\tgetVariantVersions(gameType: $gameType, variant: $variant)\n\t}\n": typeof types.GetVariantVersionsDocument,
    "\n\tmutation CreateInstance($input: CreateInstanceInput!) {\n\t\tcreateInstance(input: $input) {\n\t\t\tid\n\t\t\tname\n\t\t\tstatus\n\t\t}\n\t}\n": typeof types.CreateInstanceDocument,
    "\n\tquery GetSystemStats {\n\t\tsystemStats {\n\t\t\tplatform\n\t\t}\n\t}\n": typeof types.GetSystemStatsDocument,
    "\n\tquery GetAvailableRuntimes($type: RuntimeType!) {\n\t\tavailableRuntimes(type: $type) {\n\t\t\tversion\n\t\t\tflags\n\t\t}\n\t}\n": typeof types.GetAvailableRuntimesDocument,
    "\n\tsubscription InstanceSetupLogs($correlationId: String!) {\n\t\tinstanceSetupLogs(correlationId: $correlationId) {\n\t\t\tmessage\n\t\t\ttimestamp\n\t\t}\n\t}\n": typeof types.InstanceSetupLogsDocument,
    "\n\tquery ConsoleHistory($instanceId: ID!) {\n\t\tconsoleHistory(instanceId: $instanceId) {\n\t\t\tinstanceId\n\t\t\tline\n\t\t\ttimestamp\n\t\t\tsource\n\t\t}\n\t}\n": typeof types.ConsoleHistoryDocument,
    "\n\tsubscription ConsoleLogs($instanceId: ID!) {\n\t\tconsoleLogs(instanceId: $instanceId) {\n\t\t\tinstanceId\n\t\t\tline\n\t\t\ttimestamp\n\t\t\tsource\n\t\t}\n\t}\n": typeof types.ConsoleLogsDocument,
    "\n\tmutation SendCommand($instanceId: ID!, $command: String!) {\n\t\tsendCommand(instanceId: $instanceId, command: $command)\n\t}\n": typeof types.SendCommandDocument,
};
const documents: Documents = {
    "\n\tmutation StartServer($instanceId: ID!) {\n\t\tstartServer(instanceId: $instanceId)\n\t}\n": types.StartServerDocument,
    "\n\tmutation StopServer($instanceId: ID!) {\n\t\tstopServer(instanceId: $instanceId)\n\t}\n": types.StopServerDocument,
    "\n\tmutation RestartServer($instanceId: ID!) {\n\t\trestartServer(instanceId: $instanceId)\n\t}\n": types.RestartServerDocument,
    "\n\tquery GetGames {\n\t\tgetGames {\n\t\t\tname\n\t\t\tdeveloper\n\t\t\ticon\n\t\t\tdeveloperIcon\n\t\t\ttype\n\t\t\truntime\n\t\t\tsupportedPlatforms\n\t\t\tuserConfig {\n\t\t\t\tconfigType\n\t\t\t\tdefault\n\t\t\t}\n\t\t}\n\t}\n": types.GetGamesDocument,
    "\n\tquery GetVariants($for: GameType!) {\n\t\tgetVariants(for: $for) {\n\t\t\tname\n\t\t\tdescription\n\t\t\ticon\n\t\t\tvariant\n\t\t}\n\t}\n": types.GetVariantsDocument,
    "\n\tquery GetVariantVersions($gameType: GameType!, $variant: GameVariant!) {\n\t\tgetVariantVersions(gameType: $gameType, variant: $variant)\n\t}\n": types.GetVariantVersionsDocument,
    "\n\tmutation CreateInstance($input: CreateInstanceInput!) {\n\t\tcreateInstance(input: $input) {\n\t\t\tid\n\t\t\tname\n\t\t\tstatus\n\t\t}\n\t}\n": types.CreateInstanceDocument,
    "\n\tquery GetSystemStats {\n\t\tsystemStats {\n\t\t\tplatform\n\t\t}\n\t}\n": types.GetSystemStatsDocument,
    "\n\tquery GetAvailableRuntimes($type: RuntimeType!) {\n\t\tavailableRuntimes(type: $type) {\n\t\t\tversion\n\t\t\tflags\n\t\t}\n\t}\n": types.GetAvailableRuntimesDocument,
    "\n\tsubscription InstanceSetupLogs($correlationId: String!) {\n\t\tinstanceSetupLogs(correlationId: $correlationId) {\n\t\t\tmessage\n\t\t\ttimestamp\n\t\t}\n\t}\n": types.InstanceSetupLogsDocument,
    "\n\tquery ConsoleHistory($instanceId: ID!) {\n\t\tconsoleHistory(instanceId: $instanceId) {\n\t\t\tinstanceId\n\t\t\tline\n\t\t\ttimestamp\n\t\t\tsource\n\t\t}\n\t}\n": types.ConsoleHistoryDocument,
    "\n\tsubscription ConsoleLogs($instanceId: ID!) {\n\t\tconsoleLogs(instanceId: $instanceId) {\n\t\t\tinstanceId\n\t\t\tline\n\t\t\ttimestamp\n\t\t\tsource\n\t\t}\n\t}\n": types.ConsoleLogsDocument,
    "\n\tmutation SendCommand($instanceId: ID!, $command: String!) {\n\t\tsendCommand(instanceId: $instanceId, command: $command)\n\t}\n": types.SendCommandDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation StartServer($instanceId: ID!) {\n\t\tstartServer(instanceId: $instanceId)\n\t}\n"): (typeof documents)["\n\tmutation StartServer($instanceId: ID!) {\n\t\tstartServer(instanceId: $instanceId)\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation StopServer($instanceId: ID!) {\n\t\tstopServer(instanceId: $instanceId)\n\t}\n"): (typeof documents)["\n\tmutation StopServer($instanceId: ID!) {\n\t\tstopServer(instanceId: $instanceId)\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation RestartServer($instanceId: ID!) {\n\t\trestartServer(instanceId: $instanceId)\n\t}\n"): (typeof documents)["\n\tmutation RestartServer($instanceId: ID!) {\n\t\trestartServer(instanceId: $instanceId)\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery GetGames {\n\t\tgetGames {\n\t\t\tname\n\t\t\tdeveloper\n\t\t\ticon\n\t\t\tdeveloperIcon\n\t\t\ttype\n\t\t\truntime\n\t\t\tsupportedPlatforms\n\t\t\tuserConfig {\n\t\t\t\tconfigType\n\t\t\t\tdefault\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery GetGames {\n\t\tgetGames {\n\t\t\tname\n\t\t\tdeveloper\n\t\t\ticon\n\t\t\tdeveloperIcon\n\t\t\ttype\n\t\t\truntime\n\t\t\tsupportedPlatforms\n\t\t\tuserConfig {\n\t\t\t\tconfigType\n\t\t\t\tdefault\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery GetVariants($for: GameType!) {\n\t\tgetVariants(for: $for) {\n\t\t\tname\n\t\t\tdescription\n\t\t\ticon\n\t\t\tvariant\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery GetVariants($for: GameType!) {\n\t\tgetVariants(for: $for) {\n\t\t\tname\n\t\t\tdescription\n\t\t\ticon\n\t\t\tvariant\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery GetVariantVersions($gameType: GameType!, $variant: GameVariant!) {\n\t\tgetVariantVersions(gameType: $gameType, variant: $variant)\n\t}\n"): (typeof documents)["\n\tquery GetVariantVersions($gameType: GameType!, $variant: GameVariant!) {\n\t\tgetVariantVersions(gameType: $gameType, variant: $variant)\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation CreateInstance($input: CreateInstanceInput!) {\n\t\tcreateInstance(input: $input) {\n\t\t\tid\n\t\t\tname\n\t\t\tstatus\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation CreateInstance($input: CreateInstanceInput!) {\n\t\tcreateInstance(input: $input) {\n\t\t\tid\n\t\t\tname\n\t\t\tstatus\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery GetSystemStats {\n\t\tsystemStats {\n\t\t\tplatform\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery GetSystemStats {\n\t\tsystemStats {\n\t\t\tplatform\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery GetAvailableRuntimes($type: RuntimeType!) {\n\t\tavailableRuntimes(type: $type) {\n\t\t\tversion\n\t\t\tflags\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery GetAvailableRuntimes($type: RuntimeType!) {\n\t\tavailableRuntimes(type: $type) {\n\t\t\tversion\n\t\t\tflags\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tsubscription InstanceSetupLogs($correlationId: String!) {\n\t\tinstanceSetupLogs(correlationId: $correlationId) {\n\t\t\tmessage\n\t\t\ttimestamp\n\t\t}\n\t}\n"): (typeof documents)["\n\tsubscription InstanceSetupLogs($correlationId: String!) {\n\t\tinstanceSetupLogs(correlationId: $correlationId) {\n\t\t\tmessage\n\t\t\ttimestamp\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery ConsoleHistory($instanceId: ID!) {\n\t\tconsoleHistory(instanceId: $instanceId) {\n\t\t\tinstanceId\n\t\t\tline\n\t\t\ttimestamp\n\t\t\tsource\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery ConsoleHistory($instanceId: ID!) {\n\t\tconsoleHistory(instanceId: $instanceId) {\n\t\t\tinstanceId\n\t\t\tline\n\t\t\ttimestamp\n\t\t\tsource\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tsubscription ConsoleLogs($instanceId: ID!) {\n\t\tconsoleLogs(instanceId: $instanceId) {\n\t\t\tinstanceId\n\t\t\tline\n\t\t\ttimestamp\n\t\t\tsource\n\t\t}\n\t}\n"): (typeof documents)["\n\tsubscription ConsoleLogs($instanceId: ID!) {\n\t\tconsoleLogs(instanceId: $instanceId) {\n\t\t\tinstanceId\n\t\t\tline\n\t\t\ttimestamp\n\t\t\tsource\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation SendCommand($instanceId: ID!, $command: String!) {\n\t\tsendCommand(instanceId: $instanceId, command: $command)\n\t}\n"): (typeof documents)["\n\tmutation SendCommand($instanceId: ID!, $command: String!) {\n\t\tsendCommand(instanceId: $instanceId, command: $command)\n\t}\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;