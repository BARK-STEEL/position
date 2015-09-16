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
    this.$el.append('<tr class="header-row"><td>Symbol</td><td>Quantity</td><td>Cost Basis</td><td>Last Price</td><td>Current Value</td><td></td><td></td></tr>');
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
    this.$el.append('<tr><td><b>Total:</b></td>' + '<td>' + data[1][0] + '</td>' + '<td>$' + data[1][1] + '</td><td></td><td id="total-value"></td></tr>');
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
  } else if ( numShares.val() > numShares.attr('data-shares') && tradeType === 'sell' ){
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
  var totals = {'total_portfolio_shares':0, 'total_portfolio_basis':0};
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
        companyTotals[indTrades[i].attributes.company_symbol] = [indTrades[i].attributes.number_of_shares, (indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price)] ;
      }
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
  var newCompanySymbol = $("#buy-company-symbol").val();
  var newNumberOfShares = $("#preview-number-of-shares").val();
  var newTradeType = $("#preview-trade-type").val();
  app.trades.create({company_symbol: newCompanySymbol, number_of_shares: newNumberOfShares, trade_type: newTradeType});
  $('#PreviewModal').modal('hide');
  $('#buyModal').modal('hide');
  $('#sellModal').modal('hide');
  $('#ConfirmModal').modal('show');
});

function addPrices(){
  var companies = $('.company');
  var price = $('.current-price');
  var shares = $('.shares');
  var value = $('.totalValue');
  var totalValue = 0;
  for (var i = 0; i < companies.length; i++){
    (function (i){
      $company = $(companies[i]);
      var symbol1 = $company.data('symbol');
      var symbol2 = '#' + $company.data('symbol');
      $.ajax({
        url: '//dev.markitondemand.com/Api/v2/Quote/jsonp',
        data: {'symbol': symbol1},
        jsonp: "callback",
        dataType: "jsonp",
        success: function(ds){
          $(symbol2).append(ds.LastPrice);
          value[i].textContent = '$' + ds.LastPrice*parseInt(shares[i].textContent);
          totalValue+=ds.LastPrice*parseInt(shares[i].textContent);
          console.log(totalValue);
          $('#total-value').html('$'+totalValue);
        }
      });
    })(i);
  }

}

$(window).load(function(){
  setTimeout(function(){
    addPrices();
  },1000);
});
