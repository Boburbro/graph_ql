const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const emailService = require('../services/emailService');

// Generate a JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

const authResolvers = {
    Mutation: {
        // User registration with email verification
        async register(_, { email, password, username = null }, { prisma }) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                // If user exists but is not verified, allow re-registration
                if (!existingUser.isVerified) {
                    // Generate a new verification code and update the user
                    const verificationCode = emailService.generateVerificationCode();
                    const verificationExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

                    // Update the user record
                    await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            verificationCode,
                            verificationExpiry,
                            // Update username if provided
                            ...(username && { username }),
                        },
                    });

                    // Send verification email
                    try {
                        await emailService.sendVerificationEmail(email, verificationCode);
                    } catch (error) {
                        console.error('Failed to send verification email:', error);
                        throw new GraphQLError('Failed to send verification email. Please try again later.', {
                            extensions: {
                                code: 'EMAIL_DELIVERY_FAILED',
                            },
                        });
                    }

                    return {
                        success: true,
                        message: 'Verification code has been sent to your email.',
                    };
                }

                // If user is already verified, consider this a security issue
                throw new GraphQLError('User with that email already exists', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate verification code
            const verificationCode = emailService.generateVerificationCode();
            const verificationExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

            // Create the user (unverified)
            await prisma.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    isVerified: false,
                    verificationCode,
                    verificationExpiry,
                },
            });

            // Send verification email
            try {
                await emailService.sendVerificationEmail(email, verificationCode);
            } catch (error) {
                console.error('Failed to send verification email:', error);
                throw new GraphQLError('Failed to send verification email. Please try again later.', {
                    extensions: {
                        code: 'EMAIL_DELIVERY_FAILED',
                    },
                });
            }

            return {
                success: true,
                message: 'Please check your email for a verification code.',
            };
        },

        // Verify email with verification code
        async verifyEmail(_, { email, code }, { prisma }) {
            // Find the user
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            // Check if already verified
            if (user.isVerified) {
                throw new GraphQLError('Email is already verified', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }

            // Check verification code
            if (user.verificationCode !== code) {
                throw new GraphQLError('Invalid verification code', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }

            // Check if code has expired
            if (user.verificationExpiry < new Date()) {
                throw new GraphQLError('Verification code has expired', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }

            // Mark the user as verified
            const verifiedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verificationCode: null,
                    verificationExpiry: null,
                },
            });

            // Generate JWT token
            const token = generateToken(verifiedUser.id);

            return {
                token,
                user: verifiedUser,
            };
        },

        // Resend verification code
        async resendVerificationCode(_, { email }, { prisma }) {
            // Find the user
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            // Check if already verified
            if (user.isVerified) {
                throw new GraphQLError('Email is already verified', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }

            // Generate a new verification code
            const verificationCode = emailService.generateVerificationCode();
            const verificationExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

            // Update the user with the new code
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verificationCode,
                    verificationExpiry,
                },
            });

            // Send verification email
            try {
                await emailService.sendVerificationEmail(email, verificationCode);
            } catch (error) {
                console.error('Failed to send verification email:', error);
                throw new GraphQLError('Failed to send verification email. Please try again later.', {
                    extensions: {
                        code: 'EMAIL_DELIVERY_FAILED',
                    },
                });
            }

            return {
                success: true,
                message: 'A new verification code has been sent to your email.',
            };
        },

        // User login
        async login(_, { email, password }, { prisma }) {
            // Find the user
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new GraphQLError('Invalid email or password', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            // Check if user's email is verified
            if (!user.isVerified) {
                throw new GraphQLError('Email not verified. Please verify your email before logging in.', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new GraphQLError('Invalid email or password', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            // Generate JWT token
            const token = generateToken(user.id);

            return {
                token,
                user,
            };
        },

        // Admin login
        async adminLogin(_, { username, password }) {
            // Get admin credentials from environment variables
            const adminUsername = process.env.ADMIN_LOGIN;
            const adminPassword = process.env.ADMIN_PASSWORD;

            // Check if admin credentials are configured
            if (!adminUsername || !adminPassword) {
                throw new GraphQLError('Admin credentials not configured', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }

            // Verify credentials
            if (username !== adminUsername || password !== adminPassword) {
                throw new GraphQLError('Invalid admin credentials', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Generate special admin token
            const token = jwt.sign(
                {
                    isAdmin: true,
                    username: adminUsername
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return {
                token,
                success: true
            };
        }
    },
};

module.exports = authResolvers; 