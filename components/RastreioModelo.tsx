"use client";

import { useEffect } from "react";
import { rastrearVisualizacaoDeModelo } from "@/lib/analytics";

/*
  Não carrega script nenhum: só avisa o helper de analytics que uma página
  de modelo foi aberta (GA4 view_item · Meta ViewContent). O Pixel continua
  sendo carregado exclusivamente pelo Analytics.tsx, atrás da faixa de
  cookies. Sem preço (CLAUDE.md §3.4).
*/
export default function RastreioModelo({ nome }: { nome: string }) {
  useEffect(() => rastrearVisualizacaoDeModelo({ nome }), [nome]);
  return null;
}
