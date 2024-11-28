import React, { useState, useEffect } from "react";
import { Layout, Button, Table, Pagination, Modal, Input, Form } from "@pankod/refine";

const Dashboard: React.FC = () => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isComposeModalVisible, setIsComposeModalVisible] = useState(false);
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);

    useEffect(() => {
        fetchEmails();
    }, [currentPage]);

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/emails?page=${currentPage}`);
            const data = await response.json();
            setEmails(data.emails);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching emails:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompose = () => {
        setIsComposeModalVisible(true);
    };

    const handleReply = (email) => {
        setSelectedEmail(email);
        setIsReplyModalVisible(true);
    };

    const handleDelete = async (emailId) => {
        try {
            await fetch(`/emails/${emailId}`, { method: "DELETE" });
            fetchEmails();
        } catch (error) {
            console.error("Error deleting email:", error);
        }
    };

    const handleComposeSubmit = async (values) => {
        try {
            await fetch("/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            setIsComposeModalVisible(false);
            fetchEmails();
        } catch (error) {
            console.error("Error sending email:", error);
        }
    };

    const handleReplySubmit = async (values) => {
        try {
            await fetch(`/emails/${selectedEmail.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            setIsReplyModalVisible(false);
            fetchEmails();
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    const columns = [
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
        },
        {
            title: "From",
            dataIndex: "from",
            key: "from",
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <span>
                    <Button onClick={() => handleReply(record)}>Reply</Button>
                    <Button onClick={() => handleDelete(record.id)}>Delete</Button>
                </span>
            ),
        },
    ];

    return (
        <Layout>
            <Button onClick={handleCompose}>Compose</Button>
            <Table
                dataSource={emails}
                columns={columns}
                loading={loading}
                rowKey="id"
            />
            <Pagination
                current={currentPage}
                total={totalPages * 10}
                onChange={(page) => setCurrentPage(page)}
            />
            <Modal
                title="Compose Email"
                visible={isComposeModalVisible}
                onCancel={() => setIsComposeModalVisible(false)}
                footer={null}
            >
                <Form onFinish={handleComposeSubmit}>
                    <Form.Item name="to" label="To" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="body" label="Body" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Send
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Reply to Email"
                visible={isReplyModalVisible}
                onCancel={() => setIsReplyModalVisible(false)}
                footer={null}
            >
                <Form onFinish={handleReplySubmit}>
                    <Form.Item name="to" label="To" initialValue={selectedEmail?.from} rules={[{ required: true }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="subject" label="Subject" initialValue={`Re: ${selectedEmail?.subject}`} rules={[{ required: true }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="body" label="Body" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Send
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default Dashboard;
