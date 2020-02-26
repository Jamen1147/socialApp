import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Segment, Form, Button } from 'semantic-ui-react';
import { IActivity } from '../../../app/models/activity';
interface IProps {
  setEditMode: (editMode: boolean) => void;
  activity: IActivity | null;
}
const ActivityForm: React.FC<IProps> = ({
  setEditMode,
  activity: InitFormState
}) => {
  const intiForm = () =>
    InitFormState
      ? InitFormState
      : {
          id: '',
          title: '',
          category: '',
          description: '',
          date: '',
          city: '',
          venue: ''
        };

  const [activity, setActivity] = useState<IActivity>(intiForm);

  const handleSubmit = () => {
    console.log(activity);
  };

  const handleInputChange = (
    evt: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = evt.currentTarget;
    setActivity({ ...activity, [name]: value });
  };

  return (
    <Segment clearing>
      <Form onSubmit={handleSubmit}>
        <Form.Input
          placeholder='Title'
          name='title'
          value={activity.title}
          onChange={handleInputChange}
        />
        <Form.TextArea
          rows={2}
          placeholder='Description'
          name='description'
          value={activity.description}
          onChange={handleInputChange}
        />
        <Form.Input
          placeholder='Category'
          name='category'
          value={activity.category}
          onChange={handleInputChange}
        />
        <Form.Input
          type='date'
          placeholder='Date'
          name='date'
          value={activity.date}
          onChange={handleInputChange}
        />
        <Form.Input
          placeholder='City'
          name='city'
          value={activity.city}
          onChange={handleInputChange}
        />
        <Form.Input
          placeholder='Venue'
          name='venue'
          value={activity.venue}
          onChange={handleInputChange}
        />
        <Button floated='right' positive type='submit' content='Submit' />
        <Button
          onClick={() => setEditMode(false)}
          floated='right'
          type='button'
          content='Cancel'
        />
      </Form>
    </Segment>
  );
};

export default ActivityForm;
