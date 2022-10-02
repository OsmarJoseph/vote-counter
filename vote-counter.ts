import axios from "axios";

type Data = {
  pst: string;
  psi: string;
  cand: Array<{
    nm: string;
    vap: string;
    pvap: string;
  }>;
};

type MappedData = Array<{
  name: string;
  votes: string;
  votesNumber: number;
  percentage: string;
}>;

type ResultsObject = Record<
  string,
  {
    votes: string;
    percentage: string;
  }
>;
class DataFetcher {
  static async get() {
    const { data } = await axios.get<Data>(
      "https://resultados.tse.jus.br/oficial/ele2022/544/dados-simplificados/br/br-c0001-e000544-r.json"
    );
    return data;
  }
}

class VoteCounterBuilder {
  private data: Data;
  private results: MappedData = [];

  constructor(data: Data) {
    this.data = data;
  }

  private getResults(): this {
    this.results = this.data.cand.map((cand) => ({
      name: cand.nm.replace("&apos;", "'"),
      votes: new Intl.NumberFormat("pt-BR").format(Number(cand.vap)),
      votesNumber: Number(cand.vap),
      percentage: `${cand.pvap}%`,
    }));
    return this;
  }

  private sortByResults(): this {
    this.results.sort((a, b) => b.votesNumber - a.votesNumber);
    return this;
  }
  private toObject(): ResultsObject {
    return this.results.reduce(
      (accumulator, { name, votesNumber, ...rest }) => {
        accumulator[name] = rest;
        return accumulator;
      },
      {}
    );
  }

  public build(): ResultsObject {
    return this.getResults().sortByResults().toObject();
  }
}

class TableBuilder {
  private results: ResultsObject;
  constructor(results: ResultsObject) {
    this.results = results;
  }
  public build() {
    console.table(this.results);
  }
}

class PercentageLogger {
  private data: Data;
  constructor(data: Data) {
    this.data = data;
  }
  public log() {
    console.log("-----------------------------------");
    console.log("\n");
    if (this.data.psi !== this.data.pst)
      console.log(
        "\x1b[33m%s\x1b[0m",
        `Total de votos apurados: ${this.data.psi} ou ${this.data.pst}%`
      );
    else
      console.log(
        "\x1b[33m%s\x1b[0m",
        `Total de votos apurados: ${this.data.psi}`
      );

    console.log("\n");
    console.log("-----------------------------------");
  }
}

async function main() {
  console.clear();
  const data = await DataFetcher.get();
  const results = new VoteCounterBuilder(data).build();
  new PercentageLogger(data).log();
  new TableBuilder(results).build();
}

setInterval(main, 10000);
