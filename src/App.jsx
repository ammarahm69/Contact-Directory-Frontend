// Importing necessary modules
import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Popconfirm, message } from "antd";
import axios from "axios";
import { SERVER_MAIN_URL } from "./server/endpoint";
import moment from "moment";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const ContactDirectory = () => {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${SERVER_MAIN_URL}/demo/contacts`);
      if (response.status === 200) {
        const formattedContacts = response.data.map((contact) => ({
          key: contact._id,
          name: contact.user_name,
          email: contact.email,
          phone: contact.phone_number,
          designation: contact.designation,
        }));
        setContacts(formattedContacts);
      }
    } catch (error) {
      message.error("Failed to fetch contacts");
    }
  };

  const openModal = (contact = null) => {
    setCurrentContact(contact);
    setIsModalOpen(true);
    if (contact) {
      form.setFieldsValue({
        ...contact,
        date_of_birth: contact.date_of_birth
          ? moment(contact.date_of_birth)
          : null,
      });
    } else {
      form.resetFields();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentContact(null);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload = {
        user_name: values.name,
        phone_number: values.phone,
        email: values.email,

        designation: values.designation,
      };
      console.log("Payload:", payload);

      if (currentContact) {
        // Update existing contact
        axios
          .put(
            `${SERVER_MAIN_URL}/demo/contacts/${currentContact.key}`,
            payload
          )
          .then(() => {
            setContacts((prev) =>
              prev.map((contact) =>
                contact.key === currentContact.key
                  ? { ...contact, ...values }
                  : contact
              )
            );
            message.success("Contact updated successfully");
          })
          .catch(() => message.error("Failed to update contact"));
      } else {
        // Add new contact
        axios
          .post(`${SERVER_MAIN_URL}/demo/contacts`, payload)
          .then((response) => {
            setContacts((prev) => [
              ...prev,
              { key: response.data._id, ...values },
            ]);
            message.success("Contact added successfully");
          })
          .catch(() => message.error("Failed to add contact"));
      }
      closeModal();
    });
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Designation", dataIndex: "designation", key: "designation" },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            {/* Edit text is removed, replaced with icon */}
          </Button>
          <Popconfirm
            title="Are you sure to delete this contact?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {/* Delete text is removed, replaced with icon */}
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleDelete = async (key) => {
    try {
      await axios.delete(`${SERVER_MAIN_URL}/demo/contacts/${key}`);
      setContacts((prev) => prev.filter((contact) => contact.key !== key));
      message.success("Contact deleted successfully");
    } catch (error) {
      message.error("Failed to delete contact");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Contact Directory</h1>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 20 }}
      >
        Add Contact
      </Button>
      <Table
        dataSource={contacts}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={currentContact ? "Edit Contact" : "Add Contact"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please enter the phone number" },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            name="designation"
            label="Designation"
            rules={[
              { required: true, message: "Please enter the designation" },
            ]}
          >
            <Input placeholder="Enter designation" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactDirectory;
