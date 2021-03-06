import React, { Component } from 'react'
import { Form, InputNumber, Button } from 'antd';

import Common from './Common';

const FormItem = Form.Item;

class Fund extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { payroll, account, web3 } = this.props;
    payroll.addFund({
      from: account,
      value: web3.toWei(this.state.fund)
    }).then((result) => {
      if (parseInt(result.receipt.status, 10) === 1) {
        this.setState({
          fund: null,
        });
        alert("addFund done");
      } else {
        console.log(result);
        alert("addFund failed");
      }
    }).catch((error) => {
      console.log(error);
      alert("addFund Error!");
    });
  }

  handleChange = (value) => {
    this.setState({fund: value});
  }

  render() {
    const { account, payroll, web3 } = this.props;
    return (
      <div>
        <Common account={account} payroll={payroll} web3={web3} />

        <Form layout="inline" onSubmit={this.handleSubmit}>
          <FormItem>
            <InputNumber
              value={this.state.fund}
              min={1}
              onChange={this.handleChange}
            />
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!this.state.fund}
            >
              增加资金
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }

  addFund = () => {
      const { payroll, account, web3 } = this.props;
      payroll.addFund({
          from: account,
          //default input unit is ether
          value: web3.toWei(this.state.fund)
      });
      console.log('addFund success!');

  }
}

export default Fund