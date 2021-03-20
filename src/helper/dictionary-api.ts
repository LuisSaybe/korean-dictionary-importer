import request from "request-promise-native";

const VIEW_URL = "https://krdict.korean.go.kr/api/view";
const timeout = 4 * 60 * 1000;

export const getDefinition = (q: string, key: string) => {
  return request({
    qs: {
      key,
      method: "target_code",
      q,
      trans_lang: 0,
      translated: "y",
    },
    timeout,
    uri: VIEW_URL,
  });
};
