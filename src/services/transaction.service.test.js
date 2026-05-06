jest.mock("../models/Transaction", () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

const Transaction = require("../models/Transaction");
const {
  create,
  validateCreateTransactionPayload,
  listByUser,
} = require("./transaction.service");

describe("validateCreateTransactionPayload", () => {
  const base = {
    tipo: "credito",
    descricao: "Teste",
    valor: 10,
    data_lancamento: "2026-05-05T14:30:00.000Z",
  };

  it('aceita tipo "credito"', () => {
    expect(validateCreateTransactionPayload(base)).toMatchObject({
      tipo: "credito",
      descricao: "Teste",
      valor: 10,
    });
  });

  it('aceita tipo "debito"', () => {
    expect(
      validateCreateTransactionPayload({ ...base, tipo: "debito" })
    ).toMatchObject({
      tipo: "debito",
    });
  });

  it("rejeita tipo inválido com 400", () => {
    expect(() =>
      validateCreateTransactionPayload({ ...base, tipo: "outro" })
    ).toThrow('Tipo inválido. Use "debito" ou "credito".');
    try {
      validateCreateTransactionPayload({ ...base, tipo: "entrada" });
    } catch (e) {
      expect(e.statusCode).toBe(400);
    }
  });

  it("rejeita descrição vazia", () => {
    expect(() =>
      validateCreateTransactionPayload({ ...base, descricao: "   " })
    ).toThrow("descricao é obrigatória.");
  });

  it("rejeita valor não numérico ou não positivo", () => {
    expect(() =>
      validateCreateTransactionPayload({ ...base, valor: "10" })
    ).toThrow("valor deve ser um número maior que zero.");
    expect(() =>
      validateCreateTransactionPayload({ ...base, valor: 0 })
    ).toThrow("valor deve ser um número maior que zero.");
    expect(() =>
      validateCreateTransactionPayload({ ...base, valor: -5 })
    ).toThrow("valor deve ser um número maior que zero.");
  });

  it("rejeita data_lancamento inválida ou ausente", () => {
    expect(() =>
      validateCreateTransactionPayload({ ...base, data_lancamento: "" })
    ).toThrow("data_lancamento é obrigatória.");
    expect(() =>
      validateCreateTransactionPayload({ ...base, data_lancamento: "data-ruim" })
    ).toThrow("data_lancamento inválida.");
  });
});

describe("create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persiste lançamento vinculado ao usuário", async () => {
    Transaction.create.mockResolvedValue({
      _id: "644b1f2e8f0c2a0012ab3cd5",
      userId: "user1",
      tipo: "credito",
      descricao: "Pagamento",
      valor: 99.9,
      data_lancamento: new Date("2026-05-05T14:30:00.000Z"),
      createdAt: new Date("2026-05-05T15:00:00.000Z"),
      updatedAt: new Date("2026-05-05T15:00:00.000Z"),
    });

    await create("644b1f2e8f0c2a0012ab3cd4", {
      tipo: "credito",
      descricao: "Pagamento",
      valor: 99.9,
      data_lancamento: "2026-05-05T14:30:00.000Z",
    });

    expect(Transaction.create).toHaveBeenCalledTimes(1);
    expect(Transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "644b1f2e8f0c2a0012ab3cd4",
        tipo: "credito",
        descricao: "Pagamento",
        valor: 99.9,
      })
    );
  });
});

describe("listByUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna listas vazias e totalizadores zerados quando não há lançamentos", async () => {
    Transaction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });

    await expect(listByUser("644b1f2e8f0c2a0012ab3cd4")).resolves.toEqual({
      creditos: [],
      debitos: [],
      totais: { credito: 0, debito: 0 },
    });

    expect(Transaction.find).toHaveBeenCalledWith({
      userId: "644b1f2e8f0c2a0012ab3cd4",
    });
    const sortMock = Transaction.find.mock.results[0].value.sort;
    expect(sortMock).toHaveBeenCalledWith({ data_lancamento: -1 });
  });

  it("separa créditos e débitos, soma totais e preserva a ordem retornada", async () => {
    const docs = [
      {
        _id: "644b1f2e8f0c2a0012ab3cd5",
        tipo: "debito",
        descricao: "Conta de luz",
        valor: 40,
        data_lancamento: new Date("2026-05-06T12:00:00.000Z"),
        createdAt: new Date("2026-05-06T12:30:00.000Z"),
        updatedAt: new Date("2026-05-06T12:30:00.000Z"),
      },
      {
        _id: "644b1f2e8f0c2a0012ab3cd6",
        tipo: "credito",
        descricao: "Pagamento",
        valor: 100,
        data_lancamento: new Date("2026-05-05T12:00:00.000Z"),
        createdAt: new Date("2026-05-05T12:30:00.000Z"),
        updatedAt: new Date("2026-05-05T12:30:00.000Z"),
      },
    ];

    Transaction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(docs),
      }),
    });

    const result = await listByUser("644b1f2e8f0c2a0012ab3cd4");

    expect(result.debitos).toHaveLength(1);
    expect(result.creditos).toHaveLength(1);
    expect(result.debitos[0].valor).toBe(40);
    expect(result.creditos[0].valor).toBe(100);
    expect(result.totais).toEqual({ credito: 100, debito: 40 });
  });
});
