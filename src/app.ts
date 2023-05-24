import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import _ from 'lodash';
import moment from 'moment';
import morgan from 'morgan';
import { asyncHandler, errorHandler } from './middlewares';
import { getFilteredClinics, getMapedClinics, paginate } from './utils';
import { DENTAL_CLINICS_ENDPOINT, VET_CLINICS_ENDPOINT } from './utils/constants';

const _importDynamic = new Function('modulePath', 'return import(modulePath)');

async function fetch(...args) {
  const { default: fetch } = await _importDynamic('node-fetch');
  return fetch(...args);
}

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' })); //todo fix this, and allow only certain origins
app.use(helmet());
app.use(morgan('dev'));
app.use(errorHandler);

app.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { clinicName, state, availability, page = 1, limit = 10 } = req.query;

  const [dentalClinics, vetClinics] = await Promise.all([
    fetch(DENTAL_CLINICS_ENDPOINT).then((resp) => resp.json()),
    fetch(VET_CLINICS_ENDPOINT).then((resp) => resp.json()),
  ]);

  let clinics = getMapedClinics(dentalClinics, vetClinics); //combining all the different clinics

  if (clinicName) clinics = getFilteredClinics({ clinics, value: clinicName, key: 'clinicName' });  //exact match, we can handle this thing from the database level, by applying the regexes
  if (state) clinics = clinics.filter((item: any) => item.stateCode === state || item.stateName === state) //exact match, we can handle this thing from the database level, by applying the regexes

  if (!_.isEmpty(availability)) {
    try {
      const { from, to } = JSON.parse(availability as string);
      if (from && to) {
        const fromTime = moment(from, 'HH:mm');
        const toTime = moment(to, 'HH:mm');

        clinics = clinics.filter(({ availability }: any) => {
          if (availability) {
            const itemFrom = moment(availability.from, 'HH:mm');
            const itemTo = moment(availability.to, 'HH:mm');

            return itemFrom.isSameOrAfter(fromTime) && itemTo.isSameOrBefore(toTime);
          }
          return false;
        });
      }
    } catch (error) {
      return res.status(500).send({ message: 'Invalid availability parameter.', success: false, clinics: [], total: 0, page, limit })
    }
  }
  const { data: paginatedClinics, total } = paginate(clinics, +page, +limit); //must be handled on DB level....

  return res.send({
    success: true,
    message: 'Clinics fetched successfully.',
    clinics: paginatedClinics,
    total,
    page: page,
    limit: limit,
  });
}));

export default app;
