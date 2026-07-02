import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import useThemeStore from "@/store/useThemeStore";
import useNotificationStore from "@/store/useNotificationStore";
import { LangEnum } from "@/type/lang";
import { showSystemNotification } from "@/utils/notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function GeneralConfig() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { theme, setTheme } = useThemeStore();
  const { enabled: notificationEnabled, setEnabled: setNotificationEnabled } =
    useNotificationStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {t("setting:subtitle.general_config")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Label className="min-w-[80px] text-sm font-medium">
            {t("setting:fields.language")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {[
              [LangEnum.ZH, "common:lang.zh"],
              [LangEnum.ZH_HANT, "common:lang.zh-Hant"],
              [LangEnum.JA, "common:lang.ja"],
              [LangEnum.EN, "common:lang.en"],
            ].map(([value, labelKey]) => (
              <Button
                key={value}
                size="sm"
                variant={language === value ? "default" : "outline"}
                onClick={() => changeLanguage(value as LangEnum)}
              >
                {t(labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Label className="min-w-[80px] text-sm font-medium">
            {t("setting:fields.theme")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {(["light", "dark", "system"] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={theme === value ? "default" : "outline"}
                onClick={() => setTheme(value)}
              >
                {t(`setting:fields.${value}_mode`)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Label className="min-w-[80px] text-sm font-medium">
            {t("setting:fields.notification.label")}
          </Label>
          <div className="flex items-center gap-3">
            <Switch
              checked={notificationEnabled}
              onCheckedChange={(checked) => {
                setNotificationEnabled(checked);
                if (checked) {
                  showSystemNotification(
                    t("setting:fields.notification.test_title"),
                    t("setting:fields.notification.test_body"),
                    true
                  );
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!notificationEnabled}
              onClick={() =>
                showSystemNotification(
                  t("setting:fields.notification.test_title"),
                  t("setting:fields.notification.test_body"),
                  true
                )
              }
            >
              <Bell className="h-4 w-4" />
              {t("setting:fields.notification.test_btn")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GeneralConfig;
