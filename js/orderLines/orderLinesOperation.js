function orderLinesOperation()
{
  this.addDish = new orderLines_AddDish();

  this.orderLines_Delete = orderLines_Delete;
  this.orderLines_Edit = orderLines_Edit;
  this.orderLinesData_Change = orderLinesData_Change;
}

function orderLines_Delete(id)
{
  test = Ext.Msg.show({
    title:'Удаление блюда из заказ',
    msg: 'Данное действие приведет к удалению блюда из заказа, Вы действительно хотите произвести удаление ?',
    buttons: Ext.Msg.YESNO,
    fn: function(btn)
    {
      if ( btn == 'yes' )
      {
        Ext.Ajax.request({
          url: '../includes/delete_orderLine.php',
          params: 'id=' + id,
          success: function(response)
          {
            Ext.getStore('orderLineStore').load();
          }
        });
      }
    },
    icon: Ext.Msg.ERROR
  });
}

function orderLines_Edit()
{
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
      fieldLabel: 'Количество',
      name: 'dish_amount',
      id: 'dish_amount',
      maxValue: 99,
      minValue: 0,
      width: 350
    },
    {
      xtype: 'textfield',
      fieldLabel: 'ID',
      name: 'id_orderList',
      id: 'id_orderList',
      hidden: true
    }],
    buttons:[
    {
      text: 'Оправить',
      handler: function()
      {
        Ext.getCmp('edit_form_order').submit({
          url: '../../includes/orderLines_Edit.php',
          success: function(form, action)
          {
            Ext.MessageBox.alert('Изменение заказа','Данные успешно изменены');
            Ext.getStore('orderLineStore').load();
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
        Ext.getCmp('editWindow').close();
      }
    }]
  });

  this.editWindow = Ext.create('Ext.window.Window', {
    title: 'Редактирование',
    height: 120,
    width: 400,
    layout: 'fit',
    modal: true,
    id: 'editWindow',
    items: orderLinesObject.orderLinesOperation.editForm,
    bodyStyle: {background: '#ffffff'}
  }).show();

  this.orderLinesData_Change();
}

function orderLinesData_Change()
{
  var temp_data = Ext.getCmp('orderLineTable').selModel.selected.items[0].data;
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
        case 'numberfield':
        {
          Ext.getCmp(i).setValue( temp_data[i] );
          break;
        }
      }
    }
  }
}