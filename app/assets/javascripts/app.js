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
  },
  render: function(){
    this.$el.empty();
    this.$el.append('<tr class="header-row"><th>Ticker Symbol <a href="#" data-toggle="popover" data-content="The collection of characters representing a company listed on an exchange."><i class="glyphicon glyphicon-info-sign"></i></a></td><th>Current Price <a href="#" data-toggle="popover" data-content="The current price at which a company\'s stock is trading."><i class="glyphicon glyphicon-info-sign"></i></a></td><th>Quantity <a href="#" data-toggle="popover" data-content="The total number of shares of stock owned for a particular company."><i class="glyphicon glyphicon-info-sign"></i></a></td><th>Cost Basis <a href="#" data-toggle="popover" data-content="The original price of an asset, used to determine capital gains."><i class="glyphicon glyphicon-info-sign"></i></a></td><th>Current Value <a href="#" data-toggle="popover" data-content="The current price of a stock multiplied by the total number of shares owned."><i class="glyphicon glyphicon-info-sign"></i></a></td><th >Total +/- <a href="#" data-toggle="popover" data-content="The difference between the cost basis and the current value."><i class="glyphicon glyphicon-info-sign"></i></a></td><th style="text-align:center" colspan="2">Make Trade</td><td></td></tr>');
    var data = companyData();
    var trades = data[0];
    var view;
    for ( var i = 0; i < trades.length; i++ ){
      if (trades[ i ].number_of_shares > 0){
        view = new app.TradeView({
          model: trades[ i ]
        });
        view.render();
        this.$el.append( view.$el );
      }
    }
    var color;
    if (data[1][3] > 0){
      color = "green";
    } else {
      color = "red";
    }
    this.$el.append('<tr><td></td><td></td><td><b>Total:</b></td><td>$' + data[1][1] + '</td><td>$' + data[1][2] + '</td><td style="color: ' + color + '">$' + Math.abs(data[1][3]) + '</td><td></td><td></td><td></td></tr>');
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

$(document).on('click', '.preview_order', function(e){
  $this = $(this);
  var price = $('#previewstockPrice').html().slice(1);
  var numShares = $this.parent().parent().find('.numShares');
  var order = ((numShares.val()*price)+7.95).toFixed(2);
  var tradeType = $this.parent().prev().prev().children().first().val();
  if (order > parseFloat($('#cash').text()) && tradeType === 'buy'){
    numShares.css('border','1px solid red');
  } else if ( numShares.val() > parseFloat(numShares.attr('data-shares')) && tradeType === 'sell' ){
    numShares.css('border','1px solid red');
  } else {
    if ( numShares.val() ==="" ) {
      numShares.css('border','1px solid red');
    } else {
      $this = $(this);
      numShares.css('border', '1px solid black');
      console.log('shares:' + numShares.val());
      $('#previewNumShares').html(numShares.val());
      $('#preview-number-of-shares').val(numShares.val());
      $('#preview-order-value').html('$' + order);
      $('#preview-trade-type').val(tradeType);
      $('#previewTradeType').html(tradeType.charAt(0).toUpperCase() + tradeType.substring(1));
      $('#PreviewModal').modal('show');
    }
  }
});

$(document).on('click', '.cancel', function(e){
  location.reload();
});

$(document).on('click', '.confirm', function(e){
  $('.numShares').attr('data-shares', 0);
});

$(document).on('click', '#buy-button', function(e){
    $this = $(this);
    var stock = $this.data('symbol');
    var companies = companyData()[0];
    var stockOwned = false;
    var shares1;
    for (var i = 0; i < companies.length; i++){
      if ( companies[i].company_symbol === stock ) {
        shares1 = companies[i].number_of_shares;
        stockOwned = true;
      }
    }
    if ( stockOwned === false ){
      shares1 = 0;
    }
    $('.numShares').attr('data-shares', 0);
    $('.numShares').attr('data-shares', shares1);
    $('.buy-symbol').val(stock);
    getStock(stock);
});
$(document).on('click', '#exit-button', function(e){
  $('.modal-backdrop').hide();
});

$(document).on('click', '#sell-button', function(e){
    $this = $(this);
    var stock = $this.data('symbol');
    var companies = companyData()[0];
    var stockOwned = false;
    var shares2;
    for (var i = 0; i < companies.length; i++){
      if ( companies[i].company_symbol === stock ) {
        shares2 = companies[i].number_of_shares;
        stockOwned = true;
      }
    }
    if ( stockOwned === false ){
      shares2 = 0;
    }
    $('.numShares').attr('data-shares', 0);
    $('.numShares').attr('data-shares', shares2);
    $('.buy-symbol').val(stock);
    getStock(stock);
});
function getStock(stock) {
      $.ajax({
        url: '//dev.markitondemand.com/Api/v2/Quote/jsonp',
        data: {'symbol': stock},
        jsonp: "callback",
        dataType: "jsonp",
        success: function(ds){
          drawHtml(ds);
        }
      });
      return false;
}
function drawHtml(jsonResult) {
    console.log('draw');
      $('.stockPrice').html(jsonResult.LastPrice);
      $('#previewstockPrice').html('$' + jsonResult.LastPrice);

      $('.coSymbol').html(jsonResult.Symbol);
      $('.coSymb').html(jsonResult.Symbol);

      // $('#numShares').html($('#modalNumShares').val());
      $('.buy-company-symbol').val(jsonResult.Symbol);
      // $('#number-of-shares').val($('#modalNumShares').val());
      return false;
}

function companyData() {

  var companyTotals = {};
  var totals = {'total_portfolio_shares':0, 'total_portfolio_basis':0, 'total_current_value':0, 'total_change':0};
  var indTrades = app.trades.models;
  for (var i = 0; i < indTrades.length; i++){
    if (indTrades[i].attributes.trade_type === 'buy'){
      totals.total_portfolio_shares += indTrades[i].attributes.number_of_shares;
      totals.total_portfolio_basis+=(indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price);
    } else {
      totals.total_portfolio_shares -= indTrades[i].attributes.number_of_shares;
      totals.total_portfolio_basis-=(indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price);
    }
    if (companyTotals[indTrades[i].attributes.company_symbol]){
      if (indTrades[i].attributes.trade_type === 'buy'){
        companyTotals[indTrades[i].attributes.company_symbol][0] += indTrades[i].attributes.number_of_shares;
        companyTotals[indTrades[i].attributes.company_symbol][1] += (indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price);
      } else {
        companyTotals[indTrades[i].attributes.company_symbol][0] -= indTrades[i].attributes.number_of_shares;
        companyTotals[indTrades[i].attributes.company_symbol][1] -= (indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price);
      }
    } else {
      if (indTrades[i].attributes.trade_type === 'buy'){
        companyTotals[indTrades[i].attributes.company_symbol] = [indTrades[i].attributes.number_of_shares, (indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price), indTrades[i].attributes.last_price] ;
      } else {
        companyTotals[indTrades[i].attributes.company_symbol] = [-indTrades[i].attributes.number_of_shares, (-indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price), indTrades[i].attributes.last_price] ;
      }
    }
  }
  companyArray = [];
  portfolioTotals = [];
  var lastPrice;
  for (var symbol in companyTotals) {
    companyArray.push({'company_symbol':symbol, 'number_of_shares':companyTotals[symbol][0], 'basis':companyTotals[symbol][1], 'last_price': companyTotals[symbol][2], 'current_value': companyTotals[symbol][2]*companyTotals[symbol][0], 'change': (companyTotals[symbol][2]*companyTotals[symbol][0]) - companyTotals[symbol][1]});
    totals.total_current_value += companyTotals[symbol][2]*companyTotals[symbol][0];
    totals.total_change += ((companyTotals[symbol][2]*companyTotals[symbol][0]) - companyTotals[symbol][1]);
  }
  portfolioTotals.push(totals.total_portfolio_shares, totals.total_portfolio_basis,totals.total_current_value.toFixed(2), totals.total_change.toFixed(2) );
  return [companyArray,portfolioTotals];
}

$('form.create-trade').on('submit', function(e){
  e.preventDefault();
  var newCompanySymbol = $("#buy-company-symbol").val();
  var newNumberOfShares = $("#preview-number-of-shares").val();
  var newTradeType = $("#preview-trade-type").val();
  app.trades.create({company_symbol: newCompanySymbol, number_of_shares: newNumberOfShares, trade_type: newTradeType});
  $('#PreviewModal').modal('hide');
  $('#buyModal').modal('hide');
  $('#sellModal').modal('hide');
  $('#ConfirmModal').modal('show');
});

$(window).load(function(){

  $('#stock_lookup_form').submit();

});

$(document).ready(function(){
  setTimeout(function(){
    $('[data-toggle="popover"]').popover();
  }, 500);
});
