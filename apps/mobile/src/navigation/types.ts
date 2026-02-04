export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  LaunchList: undefined;
  CreateLaunch: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  EditLaunch: { registroId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
