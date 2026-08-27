"use client";

import { useEffect } from "react";
import { rastrearVisualizacaoDeModelo } from "@/lib/analytics";

/*
  Não carrega script nenhum: só avisa o helper de analytics que uma página
  de modelo foi aberta (GA4 view_item · Meta ViewContent). O Pixel continua
  sendo carregado exclusivamente pelo Analytics.tsx, atrás da faixa de
  cookies. `preco` só vem quando confirmado em content/modelos.json.
*/
export default function RastreioModelo({
  nome,
  preco,
}: {
  nome: string;
  preco: number | null;
}) {
  useEffect(() => rastrearVisualizacaoDeModelo({ nome, preco }), [nome, preco]);
  return null;
}
