function orderLines_AddDish()
{
  this.menuStore = new Object();
  this.generalPanel = new Object();
  this.menuTable = new Object();
  this.editWindow = new Object();
  this.lookup = new Object();

  //Создание грида с меню для данного рестрана
  this.menuTable_Create = menuTable_Create;
  //Добаление новых свойств
  this.menuStore_Change = menuStore_Change;
  //Сбор данных для отправки - те которые выделены
  this.orderLines_Collection = orderLines_Collection;
  this.editWindow_Create = editWindow_Create;
  //Компоновка компонентов
  this.menuComponent_Add = menuComponent_Add;

  this.menuTable_Create();
}

function editWindow_Create()
{
  this.menuTable_Create();
  this.menuComponent_Add();
  if ( Ext.getCmp('ordersTable').selModel.selected.items.length > 0 && Ext.getStore('orderLineStore').data.items.length > 0 )
  {
    this.editWindow = Ext.create('Ext.window.Window', {
      title: 'Добавление блюд к заказу',
      height: Ext.select('html').elements[0].offsetHeight,
      width: Ext.select('html').elements[0].offsetWidth,
      layout: 'fit',
      modal: true,
      id: 'editWindow',
      items: Ext.getCmp('generalPanel'),
      bodyStyle: {background: '#ffffff'}
    });
    this.editWindow.show();
  }
}

function menuComponent_Add()
{
  this.menuStore_Change();
}

function menuStore_Change()
{
  var temp = this.menuStore.data.items.length;
  for ( i = 0; i < temp; ++i )
  {
    this.menuStore.data.items[i].data.checked = false;
    this.menuStore.data.items[i].data.amount = 0;
  }
  Ext.getCmp('menuTable').reconfigure( this.menuStore );
}

function add_orderList()
{
  add_componentMenu();
  if ( Ext.getCmp('ordersTable').selModel.selected.items.length > 0 && Ext.getStore('orderLineStore').data.items.length > 0 )
  {
    Ext.create('Ext.window.Window', {
      title: 'Добавление блюд к заказу',
      height: Ext.select('html').elements[0].offsetHeight,
      width: Ext.select('html').elements[0].offsetWidth,
      layout: 'fit',
      modal: true,
      id: 'edit_window',
      items: Ext.getCmp('panel_menu_table'),
      bodyStyle: {background: '#ffffff'}
    }).show();
  }
}

function menuTable_Create()
{
  this.lookup = new menuTypeLookup(this);
  this.menuStore = Ext.create('Ext.data.Store', {
    storeId:'menuStore',
    fields:['removability', 'editability', 'checked', 'amount', 'name', 'shortDescription', 'Description', 'price', 'article', 'energyValuePortion', 'energyValue100'],
    proxy: 
    {
      type: 'ajax',
      url: '../outputs/outputMenu.php?bssid=' + owner_object.restorant['bssid'],
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
        orderLinesObject.orderLinesOperation.addDish.menuStore_Change();
      }
    },
    autoLoad: true,
    autoSync: false
  });

  this.generalPanel = Ext.create('Ext.Panel', {
    title: 'Меню ресторана',
    id: 'generalPanel',
    layout:
    {
      type: 'vbox',
      align: 'stretch'
    }
  });

  this.menuTable = Ext.create('Ext.grid.Panel', {
    id: 'menuTable',
    scroll: 'vertical',
    flex: 3,
    store: Ext.data.StoreManager.lookup('menuStore'),
    columns: [
      { dataIndex: 'checked', width: 32, xtype : 'checkcolumn'},
      { text: 'Количество', width: 90, dataIndex: 'amount', editor: 'numberfield', align: 'center'},
      { text: 'Название',  dataIndex: 'name', flex: 1},
      { text: 'Краткое описание', dataIndex: 'shortDescription', flex: 2 },
      { text: 'Полное описание', dataIndex: 'Description', flex: 2 },
      { text: 'Эн. ценность порции', dataIndex: 'energyValuePortion', width: 160,align: 'center'},
      { text: 'Эн. ценность 100гр.', dataIndex: 'energyValue100', width: 160,align: 'center'},
      { text: 'Стоимость', dataIndex: 'price', width: 100,align: 'center'}
    ],
    selType: 'cellmodel',
    plugins: [
      Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit: 1
      })
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
          orderLinesObject.orderLinesOperation.addDish.orderLines_Collection(orderLinesOperation.addDish);
        }
      }]
    }]
  });

  this.generalPanel.add( this.menuTable );
  this.generalPanel.insert( 0,Ext.getCmp('menuTypeLookup') );
}

function send_additional_data(data)
{
  Ext.Ajax.request({
    url: '../includes/update_orderList.php',
    params: 'data=' + data,
    success: function(response)
    {
      Ext.getStore('orderLineStore').load();
      Ext.getCmp('editWindow').close();
    }
  });
}

function orderLines_Collection()
{
  var temp = Ext.getStore('menuStore').data.items;
  var temp_array = new Array();
  temp_array.push({'id_order':Ext.getCmp('ordersTable').selModel.selected.items[0].data.orders_id});
  for ( i = 0; i < temp.length; ++i )
  {
    if ( temp[i].data['checked'] == true && temp[i].data['amount'] > 0 )
    {
      temp_array.push({'id_menu':temp[i].data['article'],'amount':temp[i].data['amount']});
    }
  }

  if ( temp_array.length > 1 )
  {
    send_additional_data( Ext.JSON.encode( temp_array ) );
  }
}