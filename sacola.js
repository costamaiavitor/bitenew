/* Sacola da Bites: guarda itens, soma, monta mensagem e link do WhatsApp.
   Funciona no navegador (window.Sacola) e no Node (testes). */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Sacola = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  const cents = v => Math.round(v * 100);

  function preco(v) {
    const c = Math.round(v * 100);
    const inteiro = Math.floor(c / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'R$ ' + inteiro + ',' + String(c % 100).padStart(2, '0');
  }

  function ler(storage, chave) {
    try {
      const bruto = storage && storage.getItem(chave);
      const lista = bruto ? JSON.parse(bruto) : [];
      if (!Array.isArray(lista)) return [];
      return lista
        .filter(i => i && i.id !== undefined && i.id !== null && i.id !== '')
        .map(i => ({ id: String(i.id), nome: String(i.nome || 'Item'), preco: +i.preco, detalhe: String(i.detalhe || ''), qtd: Math.floor(+i.qtd) }))
        .filter(i => isFinite(i.preco) && i.preco >= 0 && i.qtd > 0);
    } catch (e) { return []; }
  }

  function criar(chave, storage) {
    const ouvintes = [];
    const s = {
      itens: ler(storage, chave),
      qtd(id) { const i = s.itens.find(x => x.id === id); return i ? i.qtd : 0; },
      add(item, n) {
        n = n === undefined ? 1 : Math.floor(n);
        if (n <= 0) return s;
        const i = s.itens.find(x => x.id === item.id);
        if (i) i.qtd += n;
        else s.itens.push({ id: item.id, nome: item.nome, preco: item.preco, detalhe: item.detalhe || '', qtd: n });
        return mudou();
      },
      set(id, n) {
        n = Math.floor(n) || 0;
        const i = s.itens.find(x => x.id === id);
        if (!i) return s;
        if (n <= 0) s.itens = s.itens.filter(x => x.id !== id);
        else i.qtd = n;
        return mudou();
      },
      limpar() { s.itens = []; return mudou(); },
      total() { return s.itens.reduce((t, i) => t + cents(i.preco) * i.qtd, 0) / 100; },
      contagem() { return s.itens.reduce((t, i) => t + i.qtd, 0); },
      onChange(fn) { ouvintes.push(fn); return s; }
    };
    function mudou() {
      try { storage && storage.setItem(chave, JSON.stringify(s.itens)); } catch (e) { /* sem storage: segue na memória */ }
      ouvintes.forEach(fn => fn(s));
      return s;
    }
    return s;
  }

  /* Kit de n pacotes com desconto (0.10 = 10%). sabores: { 'Milky': 4, 'Salted Caramel': 2 } */
  function kit(n, unit, desconto, sabores) {
    const pct = Math.round(desconto * 100);
    const partes = Object.entries(sabores).filter(([, q]) => q > 0);
    return {
      id: 'kit' + n + '-' + partes.map(([s, q]) => s.replace(/\s+/g, '') + q).join('-'),
      nome: 'Kit ' + n + ' pacotes',
      preco: Math.round(cents(unit) * n * (100 - pct) / 100) / 100,
      detalhe: partes.map(([s, q]) => q + 'x ' + s).join(' + ')
    };
  }

  function mensagem(itens, d) {
    d = d || {};
    const linhas = ['Oi, Bites! Quero fazer um pedido 🩷', ''];
    itens.forEach(i => {
      linhas.push('• ' + i.qtd + 'x ' + i.nome + (i.detalhe ? ' (' + i.detalhe + ')' : '') + ' — ' + preco(i.preco * i.qtd));
    });
    const total = itens.reduce((t, i) => t + cents(i.preco) * i.qtd, 0) / 100;
    linhas.push('', '*Total: ' + preco(total) + '*', '');
    if (d.nome) linhas.push('Nome: ' + d.nome);
    if (d.modo === 'entrega') {
      linhas.push('Entrega');
      if (d.endereco) linhas.push('Endereço: ' + d.endereco);
    } else linhas.push('Retirada');
    if (d.obs) linhas.push('Obs: ' + d.obs);
    return linhas.join('\n');
  }

  function link(numero, texto) {
    return 'https://wa.me/' + String(numero).replace(/\D/g, '') + '?text=' + encodeURIComponent(texto);
  }

  return { criar, preco, kit, mensagem, link };
});
