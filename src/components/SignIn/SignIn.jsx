import React from "react";
import css from "./SignIn.module.css";
import {customHistory} from "../../App";
import ErrorMessage from "../Errors/ErrorMessage/ErrorMessage";
import ErrorValidation from "../Errors/ErrorValidation/ErrorValidation";
import {googleAuth, signInRequest} from "../../service/auth";
import {Preloader} from "../Preloader/Preloader";
import {Footer} from "../Footer/Footer";
import {facebookAuthIcon, googleAuthIcon} from "../../images/svg";
import {connect} from "react-redux";
import {loaderAction, loggedAction} from "../../reducers/flags";

class SignIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            form: {
                email: '',
                password: ''
            },
            errors: null
        };
    }

    componentDidMount() {
        window.gapi.load('auth2', () => {
            window.gapi.auth2
                .init({
                    client_id:
                        '416520824005-i7rgnt5fcm7rd12av7p7h70ndvnmjodp.apps.googleusercontent.com',
                })
        });
    }

    signInWithGoogle = () => {
        window.gapi.auth2.getAuthInstance().signIn()
            .then(googleUser => {
                const id_token = googleUser.getAuthResponse().id_token;
                this.props.loaderAction();
                return googleAuth(id_token)
                    .then(response => {
                        console.log(response);
                        localStorage.setItem('TOKEN', JSON.stringify(response));
                        this.props.loggedAction();
                        customHistory.push('/dashboard');
                    })
                    .catch(error => console.log(error.message))
                    .finally(() => this.props.loaderAction());
            })
    };

    onChange = (event) => {
        this.setState({
            form: {
                ...this.state.form,
                [event.target.name]: event.target.value
            }
        });
    };

    onSubmit = (event) => {
        if (event) {
            event.preventDefault();
        }

        let errors = this.validate(this.state.form);

        if (errors) {
            this.setState({errors});
            return;
        }

        this.props.loaderAction();
        signInRequest(this.state.form)
            .then(response => {
                localStorage.setItem('TOKEN', JSON.stringify(response));
                this.props.loggedAction();
                customHistory.push('/dashboard');
            })
            .catch(error => {
                this.setState({
                    errorMessage: error.message
                });
            })
            .finally(() => this.props.loaderAction())
    };

    validate = (form) => {
        const errors = {
            email: form.email.length === 0 ? 'Login should not be empty' : null,
            password: form.password.length === 0 ? 'Password should not be empty' : null,
        };

        for (let key of Object.keys(errors)) {
            if (errors[key]) {
                return errors;
            }
        }

        return null;
    };

    isCancel = (event) => {
        if (event) {
            event.preventDefault();
        }

        this.setState({
            form: {
                email: '',
                password: '',
            },
        });
    };

    render() {
        const {errors} = this.state;
        return (
            <div>
                {(this.props.loader === true) ?
                    <Preloader/> :
                    <div>
                        <header className={css.header}>
                            <div className={css.header_title}>
                                <h1>MiniJira</h1>
                            </div>
                            <div className={css.header_nav} onClick={() => {
                                customHistory.push('/signUp')
                            }}>
                                Sign Up
                            </div>
                        </header>
                        <main className={css.main}>
                            <div className={css.content}>
                                <div className={css.form_block}>
                                    <div className={css.title}>
                                        Sign In
                                    </div>
                                    <div className={css.auth_buttons}>
                                        <button className={css.auth_button} onClick={this.signInWithGoogle}>
                                            <div className={css.auth_icon}>
                                                {googleAuthIcon()}
                                            </div>
                                            <div>
                                                Sign in with Google
                                            </div>
                                        </button>
                                        <button className={css.auth_button} onClick={this.signInWithGoogle}>
                                            <div className={css.auth_icon}>
                                                {facebookAuthIcon()}
                                            </div>
                                            <div>
                                                Sign in with Facebook
                                            </div>
                                        </button>
                                    </div>
                                    <form className={css.form} onSubmit={this.onSubmit}>
                                        <div className={css.form_group}>
                                            <label htmlFor="inputEmail">Email address:</label>
                                            <input type="text" className={css.form_control}
                                                   style={{borderColor: errors && errors.email ? 'red' : ''}}
                                                   name='email' value={this.state.form.email}
                                                   onChange={this.onChange}
                                                   aria-describedby="emailHelp" placeholder="Enter email"/>
                                            {errors && errors.email &&
                                            <ErrorValidation error={errors.email}/>}
                                        </div>
                                        <div className={css.form_group}>
                                            <label htmlFor="inputPassword">Password:</label>
                                            <input type="password" className={css.form_control}
                                                   style={{borderColor: errors && errors.password ? 'red' : ''}}
                                                   name='password'
                                                   value={this.state.form.password} onChange={this.onChange}
                                                   placeholder="Password"/>
                                            {errors && errors.password &&
                                            <ErrorValidation error={errors.password}/>}
                                        </div>
                                        <div className={css.buttons}>
                                            <button type="submit" className={css.btn}>Send</button>
                                            <button className={css.btn} onClick={this.isCancel}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                                <div className={css.error_message}>
                                    {this.props.errorMessage && <ErrorMessage/>}
                                </div>
                            </div>
                        </main>
                        <footer className={css.footer}>
                            <Footer/>
                        </footer>
                    </div>
                }
            </div>
        );
    }
}

export default connect(
    (state) => ({
        errorMessage: state.errors.errorMessage,
        loader: state.flags.loader
    }),
    (dispatch) => ({
        loaderAction: () => dispatch(loaderAction()),
        loggedAction: () => dispatch(loggedAction())
    })
)(SignIn);