"""Converte a planilha de votacao em src/data/votos.json.

Uso: python scripts/build_data.py
Requisitos: pip install openpyxl

Regras:
- Linhas sem Regiao recebem a regiao da outra cidade que compartilha a mesma
  zona eleitoral (Bonito, Cha Grande, Gloria do Goita e Pombos).
- Falha com erro se qualquer linha ficar sem regiao ou sem votos.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

import openpyxl

BASE = Path(__file__).resolve().parent.parent
ORIGEM = BASE / "2026Ivete_Por_Local_com_Regioes.xlsx"
DESTINO = BASE / "src" / "data" / "votos.json"

COL_ANO, COL_UF, COL_REGIAO, COL_CIDADE, COL_ZONA = 0, 1, 2, 3, 4
COL_LOCAL, COL_ENDERECO, COL_CARGO, COL_NUMERO, COL_NOME, COL_VOTOS = 5, 6, 7, 8, 9, 10

META = {
    "ano": 2026,
    "uf": "PE",
    "cargo": "Deputado Estadual",
    "numero": 13613,
    "nome": "IVETE CAETANO DE OLIVEIRA",
    "nomeCartao": "PROFESSORA IVETE CAETANO",
    "partido": "PT/PE",
    "situacao": "Eleita",
}


def texto(v) -> str:
    return " ".join(str(v).split()).strip() if v is not None else ""


def principal() -> dict:
    if not ORIGEM.exists():
        sys.exit(f"Planilha nao encontrada: {ORIGEM}")

    wb = openpyxl.load_workbook(ORIGEM, data_only=True)
    ws = wb.active
    linhas = list(ws.iter_rows(min_row=2, values_only=True))

    brutas: list[tuple[str, str, int, str, str, int]] = []
    identificadores: set[tuple] = set()
    for row in linhas:
        if row[COL_CIDADE] is None and row[COL_VOTOS] is None:
            continue
        identificadores.add(
            (
                row[COL_ANO],
                row[COL_UF],
                row[COL_CARGO],
                row[COL_NUMERO],
                row[COL_NOME],
            )
        )

        regiao = texto(row[COL_REGIAO])
        cidade = texto(row[COL_CIDADE])
        zona = int(row[COL_ZONA])
        local = texto(row[COL_LOCAL])
        endereco = texto(row[COL_ENDERECO])
        votos = int(row[COL_VOTOS] or 0)
        if not cidade or not local:
            sys.exit(f"Linha invalida (cidade/local vazio): {row!r}")
        brutas.append((regiao, cidade, zona, local, endereco, votos))

    esperado = (META["ano"], META["uf"], META["cargo"], META["numero"], META["nome"])
    if identificadores != {esperado}:
        sys.exit(f"Planilha com identificadores inesperados: {sorted(identificadores)}")

    # regiao por zona: usa as linhas que ja tem regiao preenchida
    regiao_por_zona: dict[int, set[str]] = defaultdict(set)
    for regiao, _cidade, zona, _l, _e, _v in brutas:
        if regiao:
            regiao_por_zona[zona].add(regiao)

    completas: list[tuple[str, str, int, str, str, int]] = []
    preenchidas = 0
    for regiao, cidade, zona, local, endereco, votos in brutas:
        if not regiao:
            opcoes = regiao_por_zona.get(zona, set())
            if len(opcoes) != 1:
                sys.exit(f"Nao foi possivel inferir a regiao de {cidade} (zona {zona})")
            regiao = next(iter(opcoes))
            preenchidas += 1
        completas.append((regiao, cidade, zona, local, endereco, votos))

    if any(v < 0 for *_d, v in completas):
        sys.exit("Existe voto negativo na planilha")

    regiao_da_cidade: dict[str, set[str]] = defaultdict(set)
    for regiao, cidade, *_resto in completas:
        regiao_da_cidade[cidade].add(regiao)
    conflitos = {c: sorted(r) for c, r in regiao_da_cidade.items() if len(r) > 1}
    if conflitos:
        sys.exit(f"Cidades com mais de uma regiao: {conflitos}")

    regioes = sorted({c[0] for c in completas})
    cidades = sorted({c[1] for c in completas})
    locais = sorted({c[3] for c in completas})
    enderecos = sorted({c[4] for c in completas})

    idx_regiao = {v: i for i, v in enumerate(regioes)}
    idx_cidade = {v: i for i, v in enumerate(cidades)}
    idx_local = {v: i for i, v in enumerate(locais)}
    idx_endereco = {v: i for i, v in enumerate(enderecos)}

    linhas_out = [
        [
            idx_regiao[r],
            idx_cidade[c],
            z,
            idx_local[l],
            idx_endereco[e],
            v,
        ]
        for r, c, z, l, e, v in completas
    ]

    arquivo = {
        "meta": META,
        "regioes": regioes,
        "cidades": cidades,
        "locais": locais,
        "enderecos": enderecos,
        "linhas": linhas_out,
    }

    total = sum(c[5] for c in completas)
    print(f"linhas: {len(linhas_out)}")
    print(f"regioes: {len(regioes)} | cidades: {len(cidades)}")
    print(f"zonas: {len({c[2] for c in completas})} | locais: {len(locais)}")
    print(f"votos totais: {total}")
    print(f"regioes preenchidas pelo agrupamento de zona: {preenchidas}")
    return arquivo


def main() -> None:
    arquivo = principal()
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(
        json.dumps(arquivo, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"gravado: {DESTINO} ({DESTINO.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
