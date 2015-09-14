console.log('scripts loaded');

var token = $('#api-token').val();
$.ajaxSetup({
  headers: {
    "accept": "application/json",
    "token": token
  }
});

var app = app || {};

app.Trade = Backbone.Model.extend({
  defaults: {
    'company_symbol': 'tbd',
    'number_of_shares': 0,
    'share_purchase_price': 0,
    'trade_type': 'tbd'
  }
});

app.TradeCollection = Backbone.Collection.extend({
  model: app.Trade,
  url: '/api/trades'
});



app.TradeView = Backbone.View.extend({
  tagName: 'tr',
  className: 'trade',
  template: _.template( $('#trade-template').html() ),
  render: function(){
    this.$el.empty();
    var html = this.template( this.model );
    var $html = $( html );
    this.$el.append( $html );
  }
});

app.TradeListView = Backbone.View.extend({
  initialize: function(){
    this.listenTo( this.collection, 'add', this.render );
  },
  render: function(){
    this.$el.empty();
    this.$el.append('<tr class="header-row"><td>Symbol</td><td>Quantity</td><td>Cost Basis</td><td></td><td></td></tr>');
    var trades = companyData()[0];
    var view;
    for ( var i = 0; i < trades.length; i++ ){
      view = new app.TradeView({
        model: trades[ i ]
      });
      view.render();
      this.$el.append( view.$el );
    }
    this.$el.append('<tr><td><b>Total:</b></td>' + '<td>' + companyData()[1][0] + '</td>' + '<td>$' + companyData()[1][1] + '</td><td></td><td></td></tr>');
  },
  events: {
  }
});

app.trades = new app.TradeCollection();


app.tradePainter = new app.TradeListView({
  collection: app.trades,
  el: $('#trades-table')
});

app.trades.fetch();


function companyData() {

  var companyTotals = {};
  var totals = {'total_portfolio_shares':0, 'total_portfolio_basis':0};
  var indTrades = app.trades.models;
  for (var i = 0; i < indTrades.length; i++){
    totals.total_portfolio_shares += indTrades[i].attributes.number_of_shares;
    totals.total_portfolio_basis+=(indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price);
    if (companyTotals[indTrades[i].attributes.company_symbol]){
      companyTotals[indTrades[i].attributes.company_symbol][0] += indTrades[i].attributes.number_of_shares;
      companyTotals[indTrades[i].attributes.company_symbol][1] += (indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price);
    } else {
      companyTotals[indTrades[i].attributes.company_symbol] = [indTrades[i].attributes.number_of_shares, (indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price)] ;
    }
  }
  companyArray = [];
  portfolioTotals = [];
  for (var symbol in companyTotals) {
    companyArray.push({'company_symbol':symbol, 'number_of_shares':companyTotals[symbol][0], 'basis':companyTotals[symbol][1]});
  }
  portfolioTotals.push(totals.total_portfolio_shares, totals.total_portfolio_basis);
  return [companyArray,portfolioTotals];
}


$('form.create-trade').on('submit', function(e){
  e.preventDefault();
  var newCompanySymbol = $("#company-symbol").val();
  var newNumberOfShares = $("#number-of-shares").val();
  var newTradeType = $("#trade-type").val();
  app.trades.create({company_symbol: newCompanySymbol, number_of_shares: newNumberOfShares, trade_type: newTradeType});
});

$(document).on('click', '.sell-button', function(e){
    $this = $(this);
    $('#company-symbol').val($this.data('symbol'));
});

$.ajax({
  url: 'http://dev.markitondemand.com/Api/v2/Quote?symbol=AAPL',
  method:'get',
  dataType:'xml',
  success:function(data){
    console.log(data);
  }
});
// Stock Backbone Models/Views

app.Stock = Backbone.Model.extend({
    initialize: function(options)   {
      if (options.stock_symbol)
      this.stock_symbol = options.stock_symbol;
        },
    url: function()
    {
        return "http://dev.markitondemand.com/Api/v2/Quote?symbol="+this.stock_symbol;
    },
});

app.StockCollection = Backbone.Collection.extend({
  model: app.Stock,
  url: this.model.url()
});



app.StockView = Backbone.View.extend({
  tagName: 'tr',
  className: 'stock',
  template: _.template( $('#stock-template').html() ),
  render: function(){
    this.$el.empty();
    var html = this.template( this.model.toJSON() );
    var $html = $( html );
    this.$el.append( $html );
  },
  events: {
        'click button' : 'getstocks'
    },
  getstocks: function() {

          var stockSymbol = this.$el.find('input').val();
          var stocks = new app.StockCollection({stock_symbol: stock_symbol});

          stocks.fetch();
      }
});
