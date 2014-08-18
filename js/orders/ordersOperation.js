function ordersOperation()
{
  this.editForm = new Object();
  this.editWindow = new Object();

  this.order_Delete = order_Delete;
  this.menuData_Change = menuData_Change;
  this.order_Edit = order_Edit;
}

function order_Delete(id)
{
  Ext.Msg.show({
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

function order_Edit(state,table)
{
  var self = this;
  this.editForm = Ext.create('Ext.form.Panel',{
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
            Ext.getCmp('editWindow').close();
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

  this.editWindow = Ext.create('Ext.window.Window', {
    title: 'Редактирование',
    height: 300,
    width: 400,
    layout: 'fit',
    modal: true,
    id: 'editWindow',
    items: self.editForm,
    bodyStyle: {background: '#ffffff'}
  }).show();

  this.menuData_Change(state,table);
}

function menuData_Change(state,table)
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