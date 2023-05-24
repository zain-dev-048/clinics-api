import { expect } from 'chai';
import moment from 'moment';
import request from 'supertest';
import app from '../src/app';

describe('GET /', () => {
  it('should return an array of clinics on GET /', async () => {
    const clinicsResponse = await request(app).get('/');
    expect(clinicsResponse.status).to.equal(200);
    expect(clinicsResponse.body).not.null;

    const { clinics, success, message } = clinicsResponse.body;

    expect(clinics).to.be.an('array');
    expect(clinics).length.be.not.null;

    expect(success).not.null;
    expect(success).to.eq(true);

    expect(message).not.null;
    expect(message).to.eq('Clinics fetched successfully.');
  });

  it('Should filter the clinics by different clinicName', async () => {
    const clinicsResponse = await request(app).get('/?clinicName=UAB Hospital');
    expect(clinicsResponse.status).to.equal(200);
    expect(clinicsResponse.body).not.null;

    const { success, message, clinics } = clinicsResponse.body;

    expect(success).not.null;
    expect(success).to.eq(true);

    expect(message).not.null;
    expect(message).to.eq('Clinics fetched successfully.');

    expect(clinics).to.be.an('array');
    expect(clinics).length.be.not.null;
    expect(clinics.every(({ clinicName }) => clinicName === 'UAB Hospital')).to.equal(true);

    const clinicsResponse2 = await request(app).get('/?clinicName=City Vet Clinic');

    expect(clinicsResponse2.body.clinics).to.be.an('array');
    expect(clinicsResponse2.body.clinics).length.be.not.null;

    expect(
      clinicsResponse2.body.clinics.every(({ clinicName }) => clinicName === 'City Vet Clinic')
    ).to.equal(true);
    expect(clinicsResponse2.body.success).not.null;
    expect(clinicsResponse2.body.success).to.eq(true);
    expect(clinicsResponse2.body.message).not.null;
    expect(clinicsResponse2.body.message).to.eq('Clinics fetched successfully.');
  });

  it('Should search clinics by state name', async () => {
    const clinicsResponse = await request(app).get('/?state=Alaska');
    expect(clinicsResponse.status).to.equal(200);
    expect(clinicsResponse.body).not.null;

    const { success, message, clinics } = clinicsResponse.body;

    expect(success).not.null;
    expect(success).to.eq(true);

    expect(message).not.null;
    expect(message).to.eq('Clinics fetched successfully.');

    expect(clinics).to.be.an('array');
    expect(clinics).length.be.not.null;
    expect(clinics.every(({ stateName }) => stateName === 'Alaska')).to.equal(true);

    const clinicsResponse2 = await request(app).get('/?state=Tennessee');

    expect(clinicsResponse2.body.clinics).to.be.an('array');
    expect(clinicsResponse2.body.clinics).length.be.not.null;
    expect(
      clinicsResponse2.body.clinics.every(({ stateName }) => stateName === 'Tennessee')
    ).to.equal(true);
    expect(clinicsResponse2.body.success).not.null;
    expect(clinicsResponse2.body.success).to.eq(true);
    expect(clinicsResponse2.body.message).not.null;
    expect(clinicsResponse2.body.message).to.eq('Clinics fetched successfully.');
  });

  it('Should search clinics by state code', async () => {
    const clinicsResponse = await request(app).get('/?state=CA');
    expect(clinicsResponse.status).to.equal(200);
    expect(clinicsResponse.body).not.null;

    const { success, message, clinics } = clinicsResponse.body;

    expect(success).not.null;
    expect(success).to.eq(true);

    expect(message).not.null;
    expect(message).to.eq('Clinics fetched successfully.');

    expect(clinics).to.be.an('array');
    expect(clinics).length.be.not.null;

    expect(clinics.every(({ stateCode }) => stateCode === 'CA')).to.equal(true);

    const clinicsResponse2 = await request(app).get('/?state=KS');

    expect(clinicsResponse2.body.clinics).to.be.an('array');
    expect(clinicsResponse2.body.clinics).length.be.not.null;
    expect(clinicsResponse2.body.clinics.every(({ stateCode }) => stateCode === 'KS')).to.equal(
      true
    );
    expect(clinicsResponse2.body.success).not.null;
    expect(clinicsResponse2.body.success).to.eq(true);
    expect(clinicsResponse2.body.message).not.null;
    expect(clinicsResponse2.body.message).to.eq('Clinics fetched successfully.');
  });

  it('Should search clinics by availablity', async () => {
    const availability = { from: '09:00', to: '20:00' };
    const clinicsResponse = await request(app).get(
      `/?availability=${JSON.stringify(availability)}`
    );
    expect(clinicsResponse.status).to.equal(200);
    expect(clinicsResponse.body).not.null;

    const { success, message, clinics } = clinicsResponse.body;

    expect(success).not.null;
    expect(success).to.eq(true);

    expect(message).not.null;
    expect(message).to.eq('Clinics fetched successfully.');

    expect(clinics).to.be.an('array');
    expect(clinics).length.be.not.null;

    expect(
      clinics.every((item: any) => {
        if (item.availability) {
          const itemFrom = moment(item.availability.from, 'HH:mm');
          const itemTo = moment(item.availability.to, 'HH:mm');
          return (
            itemFrom.isSameOrAfter(moment(availability.from, 'HH:mm')) &&
            itemTo.isSameOrBefore(moment(availability.to, 'HH:mm'))
          );
        }

        return false;
      })
    ).to.be.true;

    const availability2 = { from: '07:00', to: '22:00' };
    const clinicsResponse2 = await request(app).get(
      `/?availability=${JSON.stringify(availability2)}`
    );

    expect(clinicsResponse2.body.clinics).to.be.an('array');
    expect(clinicsResponse2.body.clinics).length.be.not.null;

    expect(clinicsResponse2.body.success).not.null;
    expect(clinicsResponse2.body.success).to.eq(true);
    expect(clinicsResponse2.body.message).not.null;
    expect(clinicsResponse2.body.message).to.eq('Clinics fetched successfully.');

    expect(
      clinicsResponse2.body.clinics.every((item: any) => {
        if (item.availability) {
          const itemFrom = moment(item.availability.from, 'HH:mm');
          const itemTo = moment(item.availability.to, 'HH:mm');
          return (
            itemFrom.isSameOrAfter(moment(availability2.from, 'HH:mm')) &&
            itemTo.isSameOrBefore(moment(availability2.to, 'HH:mm'))
          );
        }

        return false;
      })
    ).to.be.true;
  });

  describe('Errors', () => {
    it('Should throw an error for invalid availablity', async () => {
      const availability = { from: '09:00', to: '20:00' };
      const clinicsResponse = await request(app).get(
        `/?availability=${availability}}`
      );
      expect(clinicsResponse.status).to.equal(500);
      expect(clinicsResponse.body).not.null;

      const { success, message, clinics } = clinicsResponse.body;

      expect(success).to.eq(false);
      expect(success).to.eq(false);

      expect(message).not.null;
      expect(message).to.eq('Invalid availability parameter.');

      expect(clinics).to.be.an('array');
      expect(clinics).length.be.be.empty;
    })
  })

  describe("Pagination", () => {
    it('should return page and limit and total ', async () => {
      const clinicsResponse = await request(app).get('/');
      expect(clinicsResponse.status).to.equal(200);
      expect(clinicsResponse.body).not.null;

      const { clinics, success, message, page, limit, total } = clinicsResponse.body;

      expect(clinics).to.be.an('array');
      expect(clinics).length.be.not.null;

      expect(success).not.null;
      expect(success).to.eq(true);

      expect(message).not.null;
      expect(message).to.eq('Clinics fetched successfully.');

      expect(page).to.not.be.null;
      expect(limit).to.not.be.null;
      expect(total).to.not.be.null;
    });

    it('should limit the results by limit', async () => {
      const clinicsResponse = await request(app).get('/?limit=5');
      expect(clinicsResponse.status).to.equal(200);
      expect(clinicsResponse.body).not.null;

      const { clinics, success, message, page, limit, total } = clinicsResponse.body;

      expect(clinics).to.be.an('array');
      expect(clinics).length.be.not.null;

      expect(success).not.null;
      expect(success).to.eq(true);

      expect(message).not.null;
      expect(message).to.eq('Clinics fetched successfully.');

      expect(page).to.be.eq(1);
      expect(+limit).to.be.lessThanOrEqual(5);

      expect(total).to.not.be.null;
    })

    it('should return page=1 and limit=10 by default', async () => {
      const clinicsResponse = await request(app).get('/');
      expect(clinicsResponse.status).to.equal(200);
      expect(clinicsResponse.body).not.null;

      const { clinics, success, message, page, limit, total } = clinicsResponse.body;

      expect(clinics).to.be.an('array');
      expect(clinics).length.be.not.null;

      expect(success).not.null;
      expect(success).to.eq(true);

      expect(message).not.null;
      expect(message).to.eq('Clinics fetched successfully.');

      expect(page).to.be.eq(1);
      expect(+limit).to.be.eq(10);

      expect(total).to.not.be.null;
    });
  })
});
