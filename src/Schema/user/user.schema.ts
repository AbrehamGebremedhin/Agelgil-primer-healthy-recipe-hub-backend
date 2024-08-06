import mongoose from 'mongoose';
import { mongooseErrorPlugin } from '../Middleware/errors.middleware';
import { EStatus, IUser, IUserMethods, IUserModel } from './user.type';
import { checkPassword, encryptPassword, getByEmail, getById, removeByID, setStatus, update, validator } from './user.extended';

export const userSchema = new mongoose.Schema<IUser, IUserModel, IUserMethods>({

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String },
    last_name: { type: String },
    phone_number: { type: String },

}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret, opt) {
            delete ret['password'];
            return ret;
        }
    },
    statics: {
        validator,
        getByEmail,
        getById,
        removeByID,
        update,
        setStatus,
    },
    methods: {
        encryptPassword,
        checkPassword,
    }
});

userSchema.virtual('full_name').get(function () {
    return `${this.first_name || ''} ${this.last_name || ''}`;
});

userSchema.plugin<any>(mongooseErrorPlugin);

const UserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

export default UserModel;