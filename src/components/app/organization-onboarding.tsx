"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyOrgDocuments, useUploadOrgDocument } from "@/lib/api/hooks";
import {
  ORG_DOCUMENT_LABELS,
  ORG_DOCUMENT_TYPES,
  type OrgDocument,
  type OrgDocumentType,
} from "@/lib/api/resources";
import { useAuth } from "@/providers/auth-provider";

// On déclare les types MIME **et** les extensions: certains sélecteurs de
// fichiers (Linux/Chromium notamment) filtrent mal avec les seules extensions
// et masquent alors les PDF.
const ACCEPT = "application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg";

/**
 * Écran affiché à une structure non encore vérifiée: dépôt des justificatifs
 * puis attente de la validation par le super-admin.
 */
export function OrganizationOnboarding() {
  const { user } = useAuth();
  const { data: documents = [], isLoading } = useMyOrgDocuments();
  const rejectionReason = user?.organization?.rejectionReason ?? null;

  const byType = new Map<OrgDocumentType, OrgDocument>(
    documents.map((d) => [d.docType, d]),
  );
  const uploadedCount = ORG_DOCUMENT_TYPES.filter((t) => byType.has(t)).length;
  const allUploaded = uploadedCount === ORG_DOCUMENT_TYPES.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.25fr] lg:gap-10">
      <div className="space-y-6 lg:sticky lg:top-24">
        {/* Bandeau de statut */}
        {rejectionReason ? (
          <div className="border-destructive/30 bg-destructive/10 flex items-start gap-3 rounded-xl border p-4">
            <AlertCircle className="text-destructive mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-destructive font-medium">
                Dossier refusé par l'administrateur
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Motif : {rejectionReason}. Corrigez et re-téléversez les
                justificatifs concernés.
              </p>
            </div>
          </div>
        ) : allUploaded ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Clock className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                En attente de validation
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Vos justificatifs ont bien été reçus. Un administrateur va
                vérifier votre structure. Vous accéderez au tableau de bord dès
                son approbation.
              </p>
            </div>
          </div>
        ) : (
          <div className="border-primary/25 bg-primary/5 flex items-start gap-3 rounded-xl border p-4">
            <ShieldCheck className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">Finalisez votre inscription</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Pour garantir la fiabilité du réseau, téléversez les{" "}
                {ORG_DOCUMENT_TYPES.length} justificatifs ci-dessous. Votre
                structure sera ensuite examinée par un administrateur.
              </p>
            </div>
          </div>
        )}

        <p className="text-muted-foreground hidden text-xs lg:block">
          Formats acceptés : PDF, PNG, JPG - 25 Mo maximum par fichier. Vos
          justificatifs sont stockés de façon sécurisée et ne servent qu'à la
          vérification de votre structure.
        </p>
      </div>

      <div className="space-y-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Justificatifs de la structure</CardTitle>
            <Badge variant={allUploaded ? "success" : "neutral"}>
              {uploadedCount}/{ORG_DOCUMENT_TYPES.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {isLoading ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Chargement…
              </p>
            ) : (
              ORG_DOCUMENT_TYPES.map((docType) => (
                <DocumentRow
                  key={docType}
                  docType={docType}
                  document={byType.get(docType)}
                />
              ))
            )}
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-xs lg:hidden">
          Formats acceptés : PDF, PNG, JPG - 25 Mo maximum par fichier.
        </p>
      </div>
    </div>
  );
}

function DocumentRow({
  docType,
  document,
}: {
  docType: OrgDocumentType;
  document?: OrgDocument;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadOrgDocument();
  const [error, setError] = useState<string | null>(null);
  const uploaded = Boolean(document);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await upload.mutateAsync({ docType, file });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du téléversement.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={
              uploaded
                ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-secondary text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full"
            }
          >
            {uploaded ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <FileText className="size-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {ORG_DOCUMENT_LABELS[docType]}
            </p>
            {uploaded ? (
              <p className="text-muted-foreground truncate text-xs">
                {document?.fileName}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">Non fourni</p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant={uploaded ? "outline" : "primary"}
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          <Upload className="size-4" />
          {upload.isPending ? "Envoi…" : uploaded ? "Remplacer" : "Téléverser"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={onFile}
        />
      </div>
      {error ? <p className="text-destructive mt-2 text-xs">{error}</p> : null}
    </div>
  );
}
