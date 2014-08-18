function orderLines()
{
  this.orderLinesTable = new Object();
  this.orderLinesStore = new Object();
  this.orderLinesOperation = new orderLinesOperation();

  this.orderLinesTotalCoast = orderLinesTotalCoast;
  this.orderLinesTable_Create = orderLinesTable_Create;

  this.orderLinesTable_Create();
}

function orderLinesTotalCoast()
{
  var temStore = Ext.getStore('orderLineStore');
  var tempCoast = 0;
  for (var i = 0; i < temStore.data.items.length; ++i)
  {
    tempCoast += temStore.data.items[i].data['price'];
  }
  Ext.getCmp('totalCoast').setValue(tempCoast);
}

function orderLinesTable_Create()
{
  this.orderLinesStore = Ext.create('Ext.data.Store', {
    storeId:'orderLineStore',
    fields:['removability', 'editability','dish_name','dish_amount','price','id_orderList'],
    proxy: 
    {
      type: 'ajax',
      url: '../outputs/outputOrderLines.php',
      reader: 
      {
        type: 'json',
        totalProperty: 'totalCount'
      }
    },
    listeners:
    {
      load: function()
      {
        orderLinesObject.orderLinesTotalCoast();
      }
    },
    autoLoad: false
  });

  this.orderLinesTable_Create = Ext.create('Ext.grid.Panel', {
    id: 'orderLineTable',
    scroll: 'vertical',
    store: Ext.data.StoreManager.lookup('orderLineStore'),
    margin: 10,
    title: 'Строки заказа',
    collapsible: true,
    animCollapse: false,
    flex: 2,
    columns: [
      { dataIndex: 'editability', width: 32},
      { dataIndex: 'removability', width: 32},
      { text: 'id', dataIndex: 'id_orderList', width: 32, align: 'center'},
      { text: 'Название', dataIndex: 'dish_name', flex: 1},
      { text: 'Количество', dataIndex: 'dish_amount', width: 200, align: 'center'},
      { text: 'Стоимость', dataIndex: 'price', width: 200, align: 'center'}
    ],
    dockedItems:[
    {
      xtype: 'toolbar',
      dock: 'bottom',
      items: [
      {
        xtype: 'button',
        text: 'Добавить',
        handler:function()
        {
          //orderLinesOperation.addDish.menuTable_Create();
          orderLinesObject.orderLinesOperation.addDish.editWindow_Create();
        }
      },
      { xtype: 'tbfill' },
      {
        xtype: 'displayfield',
        fieldLabel: 'Итого',
        id: 'totalCoast',
        width: 140,
        value: '0'
      }]
    }]
  });

  var temp = ( Ext.getCmp('frame_center').getHeight() - 140 )/2;

  Ext.getCmp('frame_center').add(Ext.getCmp('ordersPanel'));
  Ext.getCmp('ordersPanel').add(Ext.getCmp('orders_filter'));
  Ext.getCmp('ordersPanel').add(Ext.getCmp('ordersTable'));
  Ext.getCmp('ordersPanel').add(Ext.getCmp('orderLineTable'));
};

Ext.onReady(function()
{
  orderLinesObject = new orderLines();
});

var orderLinesObject = new Object();
