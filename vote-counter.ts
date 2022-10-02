import axios from "axios";

type Data = {
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
      percentage: `${Number(cand.pvap.replace(",", "."))}%`,
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

async function main() {
  console.clear();
  const data = await DataFetcher.get();
  const results = new VoteCounterBuilder(data).build();
  new TableBuilder(results).build();
}

setInterval(main, 10000);
