Ext.onReady(function()
{
  Ext.create('Ext.form.Panel',{
    layout: 'column',
    margin: 10,
    title: 'Фильтр заказов',
    id: 'orders_filter',
    collapsible: true,
    animCollapse: false,
    height: 140,
    items:[
    {
      xtype: 'numberfield',
      fieldLabel: 'Номер столика',
      name: 'tableId',
      id: 'tableId',
      value: 0,
      maxValue: 99,
      minValue: 0,
      margin: 10
    },
    {
      xtype: 'datefield',
      fieldLabel: 'Дата С',
      name: 'fromDay',
      id: 'fromDay',
      maxValue: new Date(),
      format: 'Y-m-d',
      value: new Date(),
      editable: false,
      margin: 10
    },
    {
      xtype: 'datefield',
      fieldLabel: 'Дата ПО',
      name: 'toDay',
      id: 'toDay',
      maxValue: new Date(),
      format: 'Y-m-d',
      value: new Date(),
      editable: false,
      margin: 10
    },
    {
      xtype: 'timefield',
      name: 'fromTime',
      id: 'fromTime',
      fieldLabel: 'Время С',
      format: 'H:i:s',
      value: '00:00:00',
      editable: false,
      margin: 10
    },
    {
      xtype: 'timefield',
      name: 'toTime',
      id: 'toTime',
      fieldLabel: 'Время ПО',
      format: 'H:i:s',
      value: '23:59:45',
      editable: false,
      margin: 10
    }],
    buttons:[
    {
      text: 'Фильтровать',
      handler: function()
      {
        Ext.getStore('ordersStore').proxy.url = '../outputs/outputOrders.php?login=1&password=1&tableId='+( Ext.getCmp('tableId').rawValue )+'&fromDay='+( Ext.getCmp('fromDay').rawValue )+'&toDay='+( Ext.getCmp('toDay').rawValue )+'&fromTime='+( Ext.getCmp('fromTime').rawValue )+'&toTime='+( Ext.getCmp('toTime').rawValue );
        Ext.getStore('ordersStore').load();
      }
    }]
  });
});