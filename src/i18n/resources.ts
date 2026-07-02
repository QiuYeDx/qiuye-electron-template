import type { Resource } from "i18next";
import { LangEnum } from "@/type/lang";

import enAbout from "@/locales/en/about.json";
import enCommon from "@/locales/en/common.json";
import enHome from "@/locales/en/home.json";
import enSetting from "@/locales/en/setting.json";

import jaAbout from "@/locales/ja/about.json";
import jaCommon from "@/locales/ja/common.json";
import jaHome from "@/locales/ja/home.json";
import jaSetting from "@/locales/ja/setting.json";

import zhAbout from "@/locales/zh/about.json";
import zhCommon from "@/locales/zh/common.json";
import zhHome from "@/locales/zh/home.json";
import zhSetting from "@/locales/zh/setting.json";

import zhHantAbout from "@/locales/zh-Hant/about.json";
import zhHantCommon from "@/locales/zh-Hant/common.json";
import zhHantHome from "@/locales/zh-Hant/home.json";
import zhHantSetting from "@/locales/zh-Hant/setting.json";

export const resources: Resource = {
  [LangEnum.EN]: {
    common: enCommon,
    home: enHome,
    about: enAbout,
    setting: enSetting,
  },
  [LangEnum.JA]: {
    common: jaCommon,
    home: jaHome,
    about: jaAbout,
    setting: jaSetting,
  },
  [LangEnum.ZH]: {
    common: zhCommon,
    home: zhHome,
    about: zhAbout,
    setting: zhSetting,
  },
  [LangEnum.ZH_HANT]: {
    common: zhHantCommon,
    home: zhHantHome,
    about: zhHantAbout,
    setting: zhHantSetting,
  },
};

