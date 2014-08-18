function orders()
{
  this.ordersTable = new Object();
  this.ordersPanel = new Object();
  this.ordersStore = new Object();
  this.ordersOper = new ordersOperation();

  this.ordersTable_Create = ordersTable_Create;
  this.ordersTable_select = ordersTable_select;

  this.ordersTable_Create();
}

function ordersTable_select()
{
  if ( Ext.getCmp('ordersTable').selModel.selected.items[0].data.orders_id != '' )
  {
    Ext.getCmp('orderLineTable').setTitle('Строки заказа: ' + Ext.getCmp('ordersTable').selModel.selected.items[0].data.orders_id);
    Ext.getStore('orderLineStore').proxy.url = '../outputs/outputOrderLines.php?oper=auto&id_order=' + Ext.getCmp('ordersTable').selModel.selected.items[0].data.orders_id
    Ext.getStore('orderLineStore').load();
  }
}

function ordersTable_Create()
{
  this.ordersStore = Ext.create('Ext.data.Store', {
    storeId:'ordersStore',
    fields:['editability','removability','imei','day_start','time_start','time_stop','orders_id','table','order_status','user_status'],
    proxy: 
    {
      type: 'ajax',
      url: '../outputs/outputOrders.php?login=1&password=1',
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
        Ext.getStore('orderLineStore').removeAll();
      }
    },
    autoLoad: true,
    autoSync: true
  });

  this.ordersPanel = Ext.create('Ext.Panel', {
    title: 'Заказы',
    id: 'ordersPanel',
    layout:
    {
      type: 'vbox',
      align: 'stretch'
    }
  });

  this.ordersTable = Ext.create('Ext.grid.Panel', {
    id: 'ordersTable',
    scroll: 'vertical',
    title: 'Заказы',
    margin: 10,
    anchor: '100% 100%',
    collapsible: true,
    animCollapse: false,
    flex: 2,
    store: Ext.data.StoreManager.lookup('ordersStore'),
    columns: [
      { dataIndex: 'editability', width: 32},
      { dataIndex: 'removability', width: 32},
      { text: '№ заказа', dataIndex: 'orders_id', width: 60, align: 'center'},
      { text: '№ столика', dataIndex: 'table', width: 80, align: 'center'},
      { text: 'Дата',  dataIndex: 'day_start', flex: 1},
      { text: 'Регистрация начата', dataIndex: 'time_start', width: 200},
      { text: 'Регистрация окончена', dataIndex: 'time_stop', flex: 2 },
      { text: 'Статус заказа', dataIndex: 'order_status', width: 120 },
      { text: 'Статус клиента', dataIndex: 'user_status', width: 120 },
      { text: 'imei',  dataIndex: 'imei', flex: 1},
    ],
    listeners:
    {
      select:
      {
        fn: function()
        {
          ordersObject.ordersTable_select();
        }
      }
    }
  });
}

var ordersObject = new Object();

Ext.onReady(function()
{
  ordersObject = new orders();
});