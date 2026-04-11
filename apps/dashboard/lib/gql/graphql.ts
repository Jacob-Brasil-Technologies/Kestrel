/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  /** JWT access token */
  token: Scalars['String']['output'];
  user: User;
};

export type AvailableRuntimeDto = {
  __typename?: 'AvailableRuntimeDto';
  flags: Array<RuntimeFlag>;
  version: Scalars['String']['output'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ConsoleLine = {
  __typename?: 'ConsoleLine';
  instanceId: Scalars['ID']['output'];
  line: Scalars['String']['output'];
  source: ConsoleSource;
  timestamp: Scalars['DateTime']['output'];
};

export enum ConsoleSource {
  Stderr = 'STDERR',
  Stdout = 'STDOUT',
  System = 'SYSTEM'
}

export type ContentProject = {
  __typename?: 'ContentProject';
  /** Full project description in markdown */
  body: Scalars['String']['output'];
  categories: Array<Scalars['String']['output']>;
  clientSide: Scalars['String']['output'];
  dateCreated: Scalars['String']['output'];
  dateModified: Scalars['String']['output'];
  description: Scalars['String']['output'];
  downloads: Scalars['Int']['output'];
  follows: Scalars['Int']['output'];
  gallery: Array<Scalars['String']['output']>;
  gameVersions: Array<Scalars['String']['output']>;
  iconUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  license?: Maybe<Scalars['String']['output']>;
  projectType: ContentType;
  serverSide: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ContentSearchHit = {
  __typename?: 'ContentSearchHit';
  categories: Array<Scalars['String']['output']>;
  clientSide: Scalars['String']['output'];
  dateModified: Scalars['String']['output'];
  description: Scalars['String']['output'];
  downloads: Scalars['Int']['output'];
  follows: Scalars['Int']['output'];
  gameVersions: Array<Scalars['String']['output']>;
  iconUrl?: Maybe<Scalars['String']['output']>;
  latestVersion?: Maybe<Scalars['String']['output']>;
  license?: Maybe<Scalars['String']['output']>;
  projectId: Scalars['String']['output'];
  projectType: ContentType;
  serverSide: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ContentSearchResponse = {
  __typename?: 'ContentSearchResponse';
  hits: Array<ContentSearchHit>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
  totalHits: Scalars['Int']['output'];
};

export enum ContentType {
  DataPack = 'DATA_PACK',
  Mod = 'MOD',
  Modpack = 'MODPACK',
  ResourcePack = 'RESOURCE_PACK',
  Shader = 'SHADER'
}

export type ContentVersion = {
  __typename?: 'ContentVersion';
  changelog?: Maybe<Scalars['String']['output']>;
  datePublished: Scalars['String']['output'];
  dependencies: Array<ContentVersionDependency>;
  downloads: Scalars['Int']['output'];
  files: Array<ContentVersionFile>;
  gameVersions: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  loaders: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  versionNumber: Scalars['String']['output'];
  /** release, beta, or alpha */
  versionType: Scalars['String']['output'];
};

export type ContentVersionDependency = {
  __typename?: 'ContentVersionDependency';
  /** required, optional, incompatible, or embedded */
  dependencyType: Scalars['String']['output'];
  projectId?: Maybe<Scalars['String']['output']>;
  versionId?: Maybe<Scalars['String']['output']>;
};

export type ContentVersionFile = {
  __typename?: 'ContentVersionFile';
  filename: Scalars['String']['output'];
  primary: Scalars['Boolean']['output'];
  sha1?: Maybe<Scalars['String']['output']>;
  sha512?: Maybe<Scalars['String']['output']>;
  size: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type CoreConfig = {
  __typename?: 'CoreConfig';
  createdAt: Scalars['DateTime']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isSetup: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateAdminInput = {
  password: Scalars['String']['input'];
  /** The setup token returned by setupCore */
  setupToken: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type CreateInstanceInput = {
  gameType: GameType;
  maxMemory?: InputMaybe<Scalars['Int']['input']>;
  minMemory?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  /** Server port; if omitted the game default is used */
  port?: InputMaybe<Scalars['Int']['input']>;
  /** Version of the runtime required by the game (e.g. "21" for Java) */
  runtimeVersion: Scalars['String']['input'];
  /** The game variant / server software to use */
  variant: GameVariant;
  variantVersion: Scalars['String']['input'];
};

export type CreateUserInput = {
  username: Scalars['String']['input'];
};

/** Response when an admin creates a new user */
export type CreateUserResponse = {
  __typename?: 'CreateUserResponse';
  /** The generated temporary password. Show this to the admin once — it cannot be retrieved again. */
  generatedPassword: Scalars['String']['output'];
  user: User;
};

export type GameInfoDto = {
  __typename?: 'GameInfoDto';
  developer: Scalars['String']['output'];
  developerIcon: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  name: Scalars['String']['output'];
  runtime: RuntimeType;
  supportedPlatforms: Array<Scalars['String']['output']>;
  type: GameType;
  userConfig: Array<UserConfigEntryDto>;
};

export enum GameType {
  Factorio = 'Factorio',
  Minecraft = 'Minecraft',
  Satisfactory = 'Satisfactory'
}

export enum GameVariant {
  Fabric = 'Fabric',
  NeoForge = 'NeoForge',
  Paper = 'Paper',
  Vanilla = 'Vanilla'
}

export type InstallContentInput = {
  /** The instance to install content into */
  instanceId: Scalars['String']['input'];
  /** The mod provider project ID */
  projectId: Scalars['String']['input'];
  /** The specific version ID to install */
  versionId: Scalars['String']['input'];
};

export type InstalledContent = {
  __typename?: 'InstalledContent';
  contentType: ContentType;
  createdAt: Scalars['DateTime']['output'];
  fileHash?: Maybe<Scalars['String']['output']>;
  fileName: Scalars['String']['output'];
  /** Relative path within the instance directory */
  filePath: Scalars['String']['output'];
  iconUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  instanceId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  /** The mod provider this was installed from (e.g. modrinth) */
  provider: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  versionId: Scalars['String']['output'];
  versionNumber: Scalars['String']['output'];
};

export type InstalledRuntimeDto = {
  __typename?: 'InstalledRuntimeDto';
  path: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type Instance = {
  __typename?: 'Instance';
  createdAt: Scalars['DateTime']['output'];
  gameInfo: GameInfoDto;
  gameType: GameType;
  id: Scalars['ID']['output'];
  instancePath: Scalars['String']['output'];
  maxMemory?: Maybe<Scalars['Int']['output']>;
  minMemory?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  port?: Maybe<Scalars['Int']['output']>;
  runtime: Runtime;
  status: InstanceStatus;
  updatedAt: Scalars['DateTime']['output'];
  /** The game variant / server software (e.g. vanilla, paper, fabric) */
  variant: GameVariant;
  variantInfo: VariantInfoDto;
  variantVersion: Scalars['String']['output'];
};

export enum InstanceStatus {
  Crashed = 'CRASHED',
  Running = 'RUNNING',
  Starting = 'STARTING',
  Stopped = 'STOPPED',
  Stopping = 'STOPPING'
}

export type LoginInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Change your password. Clears the mustChangePassword flag. */
  changePassword: AuthResponse;
  /** Create the initial admin account using the setup token */
  createAdmin: AuthResponse;
  createInstance: Instance;
  /** Admin creates a new user with a generated temporary password */
  createUser: CreateUserResponse;
  deleteInstance: Scalars['Boolean']['output'];
  /** Install content from a mod provider into an instance */
  installContent: InstalledContent;
  installRuntime: Scalars['Boolean']['output'];
  /** Log in with username and password to receive a JWT */
  login: AuthResponse;
  restartServer: Scalars['Boolean']['output'];
  sendCommand: Scalars['Boolean']['output'];
  /** Verify the setup code and receive a short-lived token for creating the admin account */
  setupCore: SetupResponse;
  startServer: Scalars['Boolean']['output'];
  stopServer: Scalars['Boolean']['output'];
  /** Uninstall content from an instance */
  uninstallContent: Scalars['Boolean']['output'];
  uninstallRuntime: Scalars['Boolean']['output'];
  /** Update the core configuration (name, icon, etc.) */
  updateCore: CoreConfig;
  updateInstance: Instance;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateAdminArgs = {
  input: CreateAdminInput;
};


export type MutationCreateInstanceArgs = {
  input: CreateInstanceInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationInstallContentArgs = {
  input: InstallContentInput;
};


export type MutationInstallRuntimeArgs = {
  type: RuntimeType;
  version: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRestartServerArgs = {
  instanceId: Scalars['ID']['input'];
};


export type MutationSendCommandArgs = {
  command: Scalars['String']['input'];
  instanceId: Scalars['ID']['input'];
};


export type MutationSetupCoreArgs = {
  code: Scalars['String']['input'];
};


export type MutationStartServerArgs = {
  instanceId: Scalars['ID']['input'];
};


export type MutationStopServerArgs = {
  instanceId: Scalars['ID']['input'];
};


export type MutationUninstallContentArgs = {
  installedContentId: Scalars['ID']['input'];
};


export type MutationUninstallRuntimeArgs = {
  type: RuntimeType;
  version: Scalars['String']['input'];
};


export type MutationUpdateCoreArgs = {
  input: UpdateCoreInput;
};


export type MutationUpdateInstanceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateInstanceInput;
};

export type Query = {
  __typename?: 'Query';
  availableRuntimes: Array<AvailableRuntimeDto>;
  consoleHistory: Array<ConsoleLine>;
  /** Get project details from a mod provider */
  contentProject: ContentProject;
  /** Get available versions for a project, filtered by instance compatibility */
  contentVersions: Array<ContentVersion>;
  /** Returns the current core configuration */
  coreConfig?: Maybe<CoreConfig>;
  getGames: Array<GameInfoDto>;
  /** Get available server versions for a game variant */
  getVariantVersions: Array<Scalars['String']['output']>;
  getVariants: Array<VariantInfoDto>;
  /** Whether any users have been created yet */
  hasUsers: Scalars['Boolean']['output'];
  /** List all installed content for an instance */
  installedContent: Array<InstalledContent>;
  installedRuntimes: Array<InstalledRuntimeDto>;
  instance: Instance;
  instances: Array<Instance>;
  /** Returns the currently authenticated user */
  me: User;
  /** Search for content from mod providers, filtered by instance compatibility */
  searchContent: ContentSearchResponse;
  systemStats: SystemStats;
};


export type QueryAvailableRuntimesArgs = {
  type: RuntimeType;
};


export type QueryConsoleHistoryArgs = {
  instanceId: Scalars['ID']['input'];
};


export type QueryContentProjectArgs = {
  projectId: Scalars['String']['input'];
};


export type QueryContentVersionsArgs = {
  instanceId: Scalars['ID']['input'];
  projectId: Scalars['String']['input'];
};


export type QueryGetVariantVersionsArgs = {
  gameType: GameType;
  variant: GameVariant;
};


export type QueryGetVariantsArgs = {
  for: GameType;
};


export type QueryInstalledContentArgs = {
  instanceId: Scalars['ID']['input'];
};


export type QueryInstalledRuntimesArgs = {
  type: RuntimeType;
};


export type QueryInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySearchContentArgs = {
  input: SearchContentInput;
};

export type Runtime = {
  __typename?: 'Runtime';
  createdAt: Scalars['DateTime']['output'];
  executablePath: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type: RuntimeType;
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['String']['output'];
};

export enum RuntimeFlag {
  Lts = 'LTS',
  Recommended = 'RECOMMENDED'
}

export enum RuntimeType {
  Java = 'Java',
  Native = 'Native',
  Steamcmd = 'Steamcmd'
}

export type SearchContentInput = {
  /** Filter by content type */
  contentType?: InputMaybe<ContentType>;
  /** The instance to search content for (determines game version and loader filtering) */
  instanceId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  /** Search query */
  query?: InputMaybe<Scalars['String']['input']>;
};

/** Response from verifying the setup code */
export type SetupResponse = {
  __typename?: 'SetupResponse';
  config: CoreConfig;
  /** Short-lived JWT for creating the initial admin account */
  setupToken: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  consoleLogs: ConsoleLine;
};


export type SubscriptionConsoleLogsArgs = {
  instanceId: Scalars['ID']['input'];
};

export type SystemStats = {
  __typename?: 'SystemStats';
  arch: Scalars['String']['output'];
  cpuCount: Scalars['Int']['output'];
  freeMemoryGB: Scalars['Float']['output'];
  platform: Scalars['String']['output'];
  runningInstances: Scalars['Int']['output'];
  totalInstances: Scalars['Int']['output'];
  totalMemoryGB: Scalars['Float']['output'];
};

export type UpdateCoreInput = {
  /** Icon image file upload */
  icon?: InputMaybe<Scalars['Upload']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInstanceInput = {
  maxMemory?: InputMaybe<Scalars['Int']['input']>;
  minMemory?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  port?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Whether the user must change their password on next login */
  mustChangePassword: Scalars['Boolean']['output'];
  role: UserRole;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type UserConfigEntryDto = {
  __typename?: 'UserConfigEntryDto';
  configType: Scalars['String']['output'];
  default: Scalars['String']['output'];
};

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER'
}

export type VariantInfoDto = {
  __typename?: 'VariantInfoDto';
  description: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  name: Scalars['String']['output'];
  variant: GameVariant;
};

export type StartServerMutationVariables = Exact<{
  instanceId: Scalars['ID']['input'];
}>;


export type StartServerMutation = { __typename?: 'Mutation', startServer: boolean };

export type StopServerMutationVariables = Exact<{
  instanceId: Scalars['ID']['input'];
}>;


export type StopServerMutation = { __typename?: 'Mutation', stopServer: boolean };

export type RestartServerMutationVariables = Exact<{
  instanceId: Scalars['ID']['input'];
}>;


export type RestartServerMutation = { __typename?: 'Mutation', restartServer: boolean };

export type GetGamesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGamesQuery = { __typename?: 'Query', getGames: Array<{ __typename?: 'GameInfoDto', name: string, developer: string, icon: string, developerIcon: string, type: GameType, runtime: RuntimeType, supportedPlatforms: Array<string>, userConfig: Array<{ __typename?: 'UserConfigEntryDto', configType: string, default: string }> }> };

export type GetVariantsQueryVariables = Exact<{
  for: GameType;
}>;


export type GetVariantsQuery = { __typename?: 'Query', getVariants: Array<{ __typename?: 'VariantInfoDto', name: string, description: string, icon: string, variant: GameVariant }> };

export type GetVariantVersionsQueryVariables = Exact<{
  gameType: GameType;
  variant: GameVariant;
}>;


export type GetVariantVersionsQuery = { __typename?: 'Query', getVariantVersions: Array<string> };

export type CreateInstanceMutationVariables = Exact<{
  input: CreateInstanceInput;
}>;


export type CreateInstanceMutation = { __typename?: 'Mutation', createInstance: { __typename?: 'Instance', id: string, name: string, status: InstanceStatus } };

export type GetSystemStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSystemStatsQuery = { __typename?: 'Query', systemStats: { __typename?: 'SystemStats', platform: string } };

export type GetAvailableRuntimesQueryVariables = Exact<{
  type: RuntimeType;
}>;


export type GetAvailableRuntimesQuery = { __typename?: 'Query', availableRuntimes: Array<{ __typename?: 'AvailableRuntimeDto', version: string, flags: Array<RuntimeFlag> }> };

export type ConsoleHistoryQueryVariables = Exact<{
  instanceId: Scalars['ID']['input'];
}>;


export type ConsoleHistoryQuery = { __typename?: 'Query', consoleHistory: Array<{ __typename?: 'ConsoleLine', instanceId: string, line: string, timestamp: any, source: ConsoleSource }> };

export type ConsoleLogsSubscriptionVariables = Exact<{
  instanceId: Scalars['ID']['input'];
}>;


export type ConsoleLogsSubscription = { __typename?: 'Subscription', consoleLogs: { __typename?: 'ConsoleLine', instanceId: string, line: string, timestamp: any, source: ConsoleSource } };

export type SendCommandMutationVariables = Exact<{
  instanceId: Scalars['ID']['input'];
  command: Scalars['String']['input'];
}>;


export type SendCommandMutation = { __typename?: 'Mutation', sendCommand: boolean };


export const StartServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"instanceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}}}]}]}}]} as unknown as DocumentNode<StartServerMutation, StartServerMutationVariables>;
export const StopServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"instanceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}}}]}]}}]} as unknown as DocumentNode<StopServerMutation, StopServerMutationVariables>;
export const RestartServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestartServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restartServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"instanceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}}}]}]}}]} as unknown as DocumentNode<RestartServerMutation, RestartServerMutationVariables>;
export const GetGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getGames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"developer"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"developerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"supportedPlatforms"}},{"kind":"Field","name":{"kind":"Name","value":"userConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"configType"}},{"kind":"Field","name":{"kind":"Name","value":"default"}}]}}]}}]}}]} as unknown as DocumentNode<GetGamesQuery, GetGamesQueryVariables>;
export const GetVariantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetVariants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"for"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GameType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getVariants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"for"},"value":{"kind":"Variable","name":{"kind":"Name","value":"for"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}}]}}]}}]} as unknown as DocumentNode<GetVariantsQuery, GetVariantsQueryVariables>;
export const GetVariantVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetVariantVersions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gameType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GameType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variant"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GameVariant"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getVariantVersions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gameType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gameType"}}},{"kind":"Argument","name":{"kind":"Name","value":"variant"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variant"}}}]}]}}]} as unknown as DocumentNode<GetVariantVersionsQuery, GetVariantVersionsQueryVariables>;
export const CreateInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateInstanceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateInstanceMutation, CreateInstanceMutationVariables>;
export const GetSystemStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSystemStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"systemStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platform"}}]}}]}}]} as unknown as DocumentNode<GetSystemStatsQuery, GetSystemStatsQueryVariables>;
export const GetAvailableRuntimesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAvailableRuntimes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RuntimeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableRuntimes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"flags"}}]}}]}}]} as unknown as DocumentNode<GetAvailableRuntimesQuery, GetAvailableRuntimesQueryVariables>;
export const ConsoleHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ConsoleHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consoleHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"instanceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceId"}},{"kind":"Field","name":{"kind":"Name","value":"line"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]} as unknown as DocumentNode<ConsoleHistoryQuery, ConsoleHistoryQueryVariables>;
export const ConsoleLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ConsoleLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consoleLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"instanceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceId"}},{"kind":"Field","name":{"kind":"Name","value":"line"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]} as unknown as DocumentNode<ConsoleLogsSubscription, ConsoleLogsSubscriptionVariables>;
export const SendCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"instanceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instanceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<SendCommandMutation, SendCommandMutationVariables>;