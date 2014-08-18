function delete_order(id)
{
  test = Ext.Msg.show({
    title:'Удаление заказа',
    id: 'dfgh',
    msg: 'Данное действие приведет к удалению заказа, Вы действительно хотите произвести удаление ?',
    buttons: Ext.Msg.YESNO,
    fn: function(btn)
    {
      if ( btn == 'yes' )
      {
        Ext.Ajax.request({
          url: '../includes/delete_order.php',
          params: 'id=' + id,
          success: function(response)
          {
            Ext.getStore('ordersStore').load();
          }
        });
      }
    },
    icon: Ext.Msg.ERROR
  });
}

Ext.onReady(function()
{
  Ext.create('Ext.data.Store', {
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

  Ext.create('Ext.Panel', {
    title: 'Заказы',
    id: 'panel_orders_table',
    layout:
    {
      type: 'vbox',
      align: 'stretch'
    }
  });

  Ext.create('Ext.grid.Panel', {
    id: 'orders_table',
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
        fn: select_ordersTable
      }
    }
  });
});

function select_ordersTable()
{
  if ( Ext.getCmp('orders_table').selModel.selected.items[0].data.orders_id != '' )
  {
    Ext.getCmp('orderLineTable').setTitle('Строки заказа: ' + Ext.getCmp('orders_table').selModel.selected.items[0].data.orders_id);
    Ext.getStore('orderLineStore').proxy.url = '../outputs/outputOrderLines.php?oper=auto&id_order=' + Ext.getCmp('orders_table').selModel.selected.items[0].data.orders_id
    Ext.getStore('orderLineStore').load();
  }
}

function edit_order(state,table)
{
  var edit_form = Ext.create('Ext.form.Panel',{
    width: 400,
    height: 400,
    layout: 'anchor',
    margin: 10,
    border: 0,
    id: 'edit_form_order',
    items:[
    {
      xtype: 'numberfield',
      fieldLabel: 'Номер столика',
      name: 'table',
      id: 'table',
      maxValue: 99,
      minValue: 1,
      width: 350
    },
    {
      xtype: 'combo',
      editable: false,
      fieldLabel: 'Статус заказа',
      store: {
        fields: ['id', 'name'],
        data : [
          {"id":"1", "name":"в обработке"},
          {"id":"2", "name":"в работе"},
          {"id":"3", "name":"выполнен"},
          {"id":"4", "name":"отменен"}
        ]
      },
      queryMode: 'local',
      displayField: 'name',
      valueField: 'id',
      id: 'order_status'
    },
    {
      xtype: 'combo',
      editable: false,
      fieldLabel: 'Действия с клиентом',
      store: {
        fields: ['id', 'name'],
        data : [
          {"id":"1", "name":"заблокирован"},
          {"id":"0", "name":"разблокирован"}
        ]
      },
      queryMode: 'local',
      displayField: 'name',
      valueField: 'id',
      id: 'user_status'
    },
    {
      xtype: 'textfield',
      fieldLabel: 'ID',
      name: 'orders_id',
      id: 'orders_id',
      hidden: true,
      value: 'new'
    },
    {
      xtype: 'textfield',
      fieldLabel: 'IMEI',
      name: 'imei',
      id: 'imei',
      hidden: true
    },
    {
      xtype: 'textfield',
      fieldLabel: 'ID ресторана',
      name: 'id_restaurant',
      id: 'id_restaurant',
      hidden: true,
      value: owner_object.restorant['id_restorant']
    },
    {
      xtype: 'textareafield',
      fieldLabel: 'Причина блок./разблок.',
      id: 'Description',
      name: 'Description',
      width: 350
    }],
    buttons:[
    {
      text: 'Оправить',
      handler: function()
      {
        Ext.getCmp('edit_form_order').submit({
          url: '../../includes/edit_order.php',
          success: function(form, action)
          {
            Ext.MessageBox.alert('Изменение заказа','Данные успешно изменены');
            Ext.getStore('ordersStore').load();
            Ext.getCmp('edit_window').close();
          },
          failure: function(form, action)
          { 
            Ext.MessageBox.alert('Изменение заказа','Ошибка изменения данных');
          }
        });
      }
    },
    {
      text: 'Отмена',
      handler: function()
      {
        Ext.getCmp('edit_window').close();
      }
    }]
  });

  Ext.create('Ext.window.Window', {
    title: 'Редактирование',
    height: 300,
    width: 400,
    layout: 'fit',
    modal: true,
    id: 'edit_window',
    items: edit_form,
    bodyStyle: {background: '#ffffff'}
  }).show();

  get_menu_data(state,table);
}

function get_menu_data(state,table)
{
  if ( state != 'new' )
  {
    var temp_data = Ext.getCmp(table).selModel.selected.items[0].data;
    for (var i in temp_data)
    {
      if ( Ext.getCmp(i) != undefined )
      {
        switch ( Ext.getCmp(i).xtype )
        {
          case 'textfield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
          case 'combo':
          {
            var temp = Ext.getCmp(i).store.data.items;
            for ( z = 0; z < temp.length; ++z )
            {
              if ( temp[z].data['name'] == temp_data[i] )
              {
                Ext.getCmp(i).select(temp[z].data['id']);
              }
            }
            break;
          }
          case 'numberfield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
          case 'displayfield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
          case 'textareafield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
        }
      }
    }
  }
}