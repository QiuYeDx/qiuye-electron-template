import { useTranslation } from "react-i18next";
import { MonitorUp } from "lucide-react";
import useUpdatePreferencesStore from "@/store/useUpdatePreferencesStore";
import { APP_REPO_OWNER, APP_REPO_NAME } from "@/constants/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UPDATE_CHECK_EVENT } from "@/components/update";

function UpdateConfig() {
  const { t } = useTranslation();
  const { autoCheck, showChangelog, setAutoCheck, setShowChangelog } =
    useUpdatePreferencesStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {t("setting:subtitle.update_config")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <div className="space-y-1">
            <Label>{t("setting:fields.update.auto_check.label")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("setting:fields.update.auto_check.desc")}
            </p>
          </div>
          <Switch checked={autoCheck} onCheckedChange={setAutoCheck} />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <div className="space-y-1">
            <Label>{t("setting:fields.update.show_changelog.label")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("setting:fields.update.show_changelog.desc")}
            </p>
          </div>
          <Switch checked={showChangelog} onCheckedChange={setShowChangelog} />
        </div>

        <div className="rounded-lg border border-dashed bg-muted/40 p-3">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("setting:fields.update.target_repo")}
          </div>
          <div className="mt-1 font-mono text-sm">
            {APP_REPO_OWNER}/{APP_REPO_NAME}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("setting:fields.update.target_repo_desc")}
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => window.dispatchEvent(new Event(UPDATE_CHECK_EVENT))}
        >
          <MonitorUp className="h-3.5 w-3.5" />
          {t("common:action.check_update")}
        </Button>
      </CardContent>
    </Card>
  );
}

export default UpdateConfig;

