import React, { Component } from 'react'
import { Table, Button, Modal, Form, InputNumber, Input, message, Popconfirm } from 'antd';

import EditableCell from './EditableCell';

const FormItem = Form.Item;

const columns = [{
  title: '地址',
  dataIndex: 'address',
  key: 'address',
}, {
  title: '薪水',
  dataIndex: 'salary',
  key: 'salary',
}, {
  title: '上次支付',
  dataIndex: 'lastPaidDay',
  key: 'lastPaidDay',
}, {
  title: '操作',
  dataIndex: '',
  key: 'action'
}];

class EmployeeList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      employees: [],
      showModal: false,
      address: null,
      salary: null
    };

    columns[1].render = (text, record) => {
      return <EditableCell
        value={text}
        onChange={ this.updateEmployee.bind(this, record.address) }
      />
    };

    columns[3].render = (text, record) => (
      <Popconfirm title="你确定删除吗?" onConfirm={() => this.removeEmployee(record.address)}>
        <a href="#">Delete</a>
      </Popconfirm>
    );
  }

  componentDidMount() {
    const { payroll } = this.props;
    const updateInfo = (error, result) => {
      if (error) {
        return;
      }
      this.loadAllEmployees();
    }

    this.getPaidEvent = payroll.GetPaid(updateInfo);
    this.newEmployeeEvent = payroll.NewEmployee(updateInfo);
    this.updateEmployeeEvent = payroll.UpdateEmployee(updateInfo);
    this.removeEmployeeEvent = payroll.RemoveEmployee(updateInfo);

    this.loadAllEmployees();
  }

  componentWillUnmount() {
    this.getPaidEvent.stopWatching();
    this.newEmployeeEvent.stopWatching();
    this.updateEmployeeEvent.stopWatching();
    this.removeEmployeeEvent.stopWatching();
  }

  loadAllEmployees = () => {
    const { payroll, account } = this.props;
    payroll.checkInfo.call({
      from: account
    }).then((result) => {
      const employeeCount = result[2].toNumber();

      if (employeeCount === 0) {
        this.setState({
          loading: false,
          employees: []
        });
      } else {
        this.loadEmployeesHelper(employeeCount);
      }
    }).catch((error) => {
      console.log(error);
      alert("loadAllEmployees fail");
    });

  }

  loadEmployeesHelper = (employeeCount) => {
        const {payroll, account, web3}=this.props;
        const requests=[];

        for(let i=0;i<employeeCount;i++){
            requests.push(payroll.checkEmployee.call(i, {from: account}));
        }

        Promise.all(requests)
        .then(values => {
            const employees = values.map(value => ({
                key:value[0],
                address:value[0],
                salary:web3.fromWei(value[1].toNumber()),
                lastPayDay:new Date(value[2].toNumber()*1000).toString()
            }));


            this.setState({
        employees: employees,
                loading:false
            });
    }).catch((error) => {
      console.log(error);
      alert("loadEmployees failed");
    });
  }

  createEmployeeFromRawData = (data) => {
    const { web3 } = this.props;
    return {
      'address': data[0],
      'salary': web3.fromWei(data[1].toNumber()),
      'lastPaidDay': (new Date(data[2].toNumber() * 1000)).toString(),
    };
  }

  addEmployee = () => {
      const {payroll, account}=this.props;
      const {address, salary, employees}=this.state;
      // console.log(account);
      payroll.addEmployee(address, salary, {from: account, gas: 310000})
      .then((result) => {
      if (parseInt(result.receipt.status, 10) === 1) {
      	this.setState({
          loading: false,
          showModal: false,
          salary: null,
          address: null,
        });
        alert("addEmployee done");
      } else {
        console.log(result);
        alert("addEmployee failed");
      }
    }).catch((error) => {
      console.log(error);
      alert("addEmployee error!");
            });
  }

  updateEmployee = (address, salary) => {
    const {payroll, account}=this.props;
    const {employees}=this.state;
    // console.log(address,salary);
    payroll.updateEmployee(address,salary,{from: account, gas: 310000}).then((result) => {
      if (parseInt(result.receipt.status, 10) === 1) {
        alert("updateEmployee done");
      } else {
        console.log(result);
        alert("updateEmployee failed");
      }
    }).catch((error) => {
      console.log(error);
      alert("updateEmployee error!");
    });

  }

  removeEmployee = (employeeId) => {
    const { payroll, account } = this.props;
    payroll.removeEmployee(
      employeeId,
      {from: account, gas: 5000000}
    ).then((result) => {
      if (parseInt(result.receipt.status, 10) === 1) {
        alert("删除员工成功！");
      } else {
        console.log(result);
        alert("删除员工失败！！！");
      }
    }).catch((error) => {
      console.log(error);
      alert("删除员工失败！！！");
    });
  }

  handleSalaryChange = (value) => {
    this.setState({salary: value});
  }

  handleAddressChange = (event) => {
    this.setState({address: event.target.value});
  }

  renderModal() {
      return (
      <Modal
          title="增加员工"
          visible={this.state.showModal}
          onOk={this.addEmployee}
          onCancel={() => this.setState({showModal: false})}
      >
        <Form>
          <FormItem label="地址">
            <Input
              value={this.state.address}
              onChange={this.handleAddressChange}
            />
          </FormItem>

          <FormItem label="薪水">
            <InputNumber
              value={this.state.salary}
              min={1}
              onChange={this.handleSalaryChange}
            />
          </FormItem>
        </Form>
      </Modal>
    );

  }

  render() {
    const { loading, employees } = this.state;
    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.setState({showModal: true})}
        >
          增加员工
        </Button>

        {this.renderModal()}

        <Table
          loading={loading}
          dataSource={employees}
          columns={columns}
        />
      </div>
    );
  }
}

export default EmployeeList
