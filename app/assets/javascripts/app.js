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
    'trade_type': 'tbd',
  },
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
    this.addPrices();
  },
  render: function(){
    this.$el.empty();
    this.$el.append('<tr class="header-row"><td>Symbol</td><td>Quantity</td><td>Cost Basis</td><td>Last Price</td><td>Current Value</td><td></td><td></td></tr>');
    var data = companyData();
    var trades = data[0];
    var view;
    for ( var i = 0; i < trades.length; i++ ){
      view = new app.TradeView({
        model: trades[ i ]
      });
      view.render();
      this.$el.append( view.$el );
    }
    this.$el.append('<tr><td><b>Total:</b></td>' + '<td>' + data[1][0] + '</td>' + '<td>$' + data[1][1] + '</td><td></td><td></td></tr>');
  },
  addPrices: function(){
    var companies = $('.company');
    for (var i = 0; i < companies.length; i++){
      (function (i){
        $company = $(companies[i]);
        var symbol1 = $company.data('symbol');
        var symbol2 = '#' + $company.data('symbol');
        $.ajax({
          url: 'https://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + symbol1,
          method: 'get',
          jsonpCallback: 'jsonCallback' + i,
          dataType: 'jsonp',
        }).done(function(json){
          $(symbol2).append(json.LastPrice);
        });
      })(i);
    }
  },
  events: {
    'load window': 'addPrices'
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
  var lastPrice;
  for (var symbol in companyTotals) {
    companyArray.push({'company_symbol':symbol, 'number_of_shares':companyTotals[symbol][0], 'basis':companyTotals[symbol][1], 'last_price': lastPrice});
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
  initialize: function(options)   {
    if (options.stock_symbol)
    this.stock_symbol = options.stock_symbol;
      },
    url: function()
    {
      return "http://dev.markitondemand.com/Api/v2/Quote?symbol="+this.stock_symbol;
    },
  // model: app.Stock,
  // url: "http://dev.markitondemand.com/Api/v2/Quote?symbol="+this.stock_symbol
});



app.StockView = Backbone.View.extend({
  tagName: 'tr',
  className: 'stock',
  template: _.template( $('#stock-template').html() ),
  initialize: function(options) {

       if (options.model)
           this.model = options.model;
   },
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

          var stockSymbol = $('.stock-input').val();
          var stocks = new app.StockCollection({stock_symbol: stockSymbol});

          stocks.fetch();
      }
});

// $(document).ready(function(){
//   setTimeout(function(){
//     addPrices();
//     console.log('hi');
//   }, 100);
// });
//
// var test = new app.StockCollection({stock_symbol: 'AAPL'});
// var testView = new app.StockView({model: test});
function addPrices(){
  var companies = $('.company');
  var price = $('.current-price');
  var shares = $('.shares');
  var value = $('.totalValue');
  for (var i = 0; i < companies.length; i++){
    (function (i){
      $company = $(companies[i]);
      var symbol1 = $company.data('symbol');
      var symbol2 = '#' + $company.data('symbol');
      $.ajax({
        url: 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + symbol1,
        method: 'get',
        jsonpCallback: 'jsonCallback' + i,
        dataType: 'jsonp',
      }).done(function(json){
        $(symbol2).append(json.LastPrice);
        value[i].textContent = '$' + parseInt(price[i].textContent)*parseInt(shares[i].textContent);
      });
    })(i);
  }
}

$(window).load(function(){
  setTimeout(function(){
    addPrices();
  },1);
});
