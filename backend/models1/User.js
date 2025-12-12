// models/User.js
require("module-alias/register");
const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const User = sequelize.define(
  "User",
  {
    firstName: { type: DataTypes.STRING, allowNull: true,field: "firstName" },
    lastName: { type: DataTypes.STRING, allowNull: true,field: "lastName"},
    full_name: { type: DataTypes.STRING, allowNull: true },
    clinic_name: { type: DataTypes.STRING, allowNull: true },
    business_name: { type: DataTypes.STRING, allowNull: true },
    abn: { type: DataTypes.STRING, allowNull: true },

    ownerName: { 
      type: DataTypes.STRING, 
      allowNull: true, 
      field: "ownerName"
    },

    website: { type: DataTypes.STRING, allowNull: true },
    business_phone: { type: DataTypes.STRING, allowNull: true },
    alternate_contact_number: { type: DataTypes.STRING, allowNull: true },
    address_line2: { type: DataTypes.STRING, allowNull: true },

    user_role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: true },
    mobile: { type: DataTypes.STRING, unique: true, allowNull: false },
    country_code: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },

    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("avatar");
        if (!rawValue) {
          return `${process.env.APP_URL}/uploads/users/no-profile.jpg`;
        }
        return `${process.env.APP_URL}${rawValue}`;
      },
    },

    clinicLogo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "clinicLogo",
      get() {
        const rawValue = this.getDataValue("clinicLogo");
        if (!rawValue) {
          return `${process.env.APP_URL}/uploads/clinics/no-profile.jpg`;
        }
        return `${process.env.APP_URL}${rawValue}`;
      },
    },

    address: { type: DataTypes.STRING, allowNull: true },
    lat: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    lon: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    push_token: { type: DataTypes.STRING, allowNull: true },
 postcode: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "postal_code"
},
    about: { type: DataTypes.STRING, allowNull: true },
    experience: { type: DataTypes.STRING, allowNull: true },
    specialists: { type: DataTypes.STRING, allowNull: true },
    device_type: { type: DataTypes.STRING, allowNull: true },
        designation: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "designation"   // 👈 Database me jo naam hai wahi likho
},
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    licenseNo: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "licenseNo"   // 👈 Database me jo naam hai wahi likho
},
    bloodGroup: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "bloodGroup"   // 👈 Database me jo naam hai wahi likho
},
bookingSystem: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "bookingSystem"   // 👈 Database me jo naam hai wahi likho
},
employeeCode: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "employeeCode"   // 👈 Database me jo naam hai wahi likho
},expertise: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "expertise"   // 👈 Database me jo naam hai wahi likho
},
stripe_customer_id: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "stripe_customer_id"   // 👈 Database me jo naam hai wahi likho
},
    languages: { type: DataTypes.STRING, allowNull: true },
    terms_accepted: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: true,
      defaultValue: "No",
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
        isVerified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  field: "isVerified"   // DB me jo column hai wahi use karo
},
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

// ✅ Add Associations
User.associate = (models) => {
  // Clinic → Operational Hours
  User.hasMany(models.ClinicOperational, {
    foreignKey: "clinic_id",
    as: "operational_hours"
  });

  // Clinic → Reviews
  User.hasMany(models.Reviews, {
    foreignKey: "clinic_id",
    as: "reviews"
  });

  // Specialist → belongs to Clinic
  User.belongsTo(models.User, {
    foreignKey: "created_by",
    as: "clinic"
  });

User.hasMany(models.Progress, {
  foreignKey: 'user_id',
  as: 'progresses'
});

User.hasMany(models.ProgressComments, {
  foreignKey: 'user_id',
  as: 'comments'
});


  // Clinic → has many Specialists
  User.hasMany(models.User, {
    foreignKey: "created_by",
    as: "specialists_list"
  });

  User.hasMany(models.ClinicServices, {
  foreignKey: "clinic_id",
  as: "clinic_services"
});
  User.hasMany(models.AssignClient, { foreignKey: 'staff_id' });

  
};

module.exports = User;
